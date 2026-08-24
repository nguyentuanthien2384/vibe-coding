import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PointsConfig } from './interfaces/points-config.interface';
import {
  LoyaltyPointsSummary,
  PointsHistoryResponse,
  TierProgressInfo,
} from './interfaces/points-summary.interface';
import { CheckoutPointsCalculationResult } from './interfaces/points-calculation-result.interface';
import { PreviewPointsCheckoutDto } from './dto/preview-points-checkout.dto';
import { PointsHistoryQueryDto } from './dto/points-history-query.dto';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { UpdatePointsConfigDto } from './dto/update-points-config.dto';
import {
  MembershipTier,
  PointsTransactionType,
  Prisma,
  NotificationType,
} from '@prisma/client';

const DEFAULT_POINTS_CONFIG: PointsConfig = {
  earnRatePercentage: 1.0,
  redeemRateVnd: 1000,
  minPointsToRedeem: 10,
  maxRedeemPercentage: 100,
  pointsExpiryDays: 0,
  tierMultipliers: {
    BRONZE: 1.0,
    SILVER: 1.1,
    GOLD: 1.25,
    DIAMOND: 1.5,
  },
  tierThresholds: {
    BRONZE: 0,
    SILVER: 2000000,
    GOLD: 5000000,
    DIAMOND: 10000000,
  },
};

@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);
  private readonly CACHE_CONFIG_KEY = 'cache:points:config';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * 1. Lấy cấu hình hệ thống điểm (từ Redis Cache hoặc DB SystemSetting)
   */
  async getPointsConfig(): Promise<PointsConfig> {
    try {
      const cached = await this.redis.get(this.CACHE_CONFIG_KEY);
      if (cached) {
        return JSON.parse(cached) as PointsConfig;
      }
    } catch (err) {
      this.logger.warn(`Redis get error for points config: ${err}`);
    }

    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'points_config' },
    });

    let config = DEFAULT_POINTS_CONFIG;
    if (setting && setting.value) {
      config = { ...DEFAULT_POINTS_CONFIG, ...(setting.value as any) };
    }

    try {
      await this.redis.setEx(this.CACHE_CONFIG_KEY, 86400, JSON.stringify(config));
    } catch (err) {
      this.logger.warn(`Redis set error for points config: ${err}`);
    }

    return config;
  }

  /**
   * 2. Admin cập nhật cấu hình hệ thống điểm
   */
  async updatePointsConfig(dto: UpdatePointsConfigDto): Promise<PointsConfig> {
    const currentConfig = await this.getPointsConfig();
    const updatedConfig: PointsConfig = {
      ...currentConfig,
      ...dto,
      tierMultipliers: {
        ...currentConfig.tierMultipliers,
        ...(dto.tierMultipliers || {}),
      },
      tierThresholds: {
        ...currentConfig.tierThresholds,
        ...(dto.tierThresholds || {}),
      },
    };

    await this.prisma.systemSetting.upsert({
      where: { key: 'points_config' },
      create: {
        key: 'points_config',
        value: updatedConfig as any,
      },
      update: {
        value: updatedConfig as any,
      },
    });

    try {
      await this.redis.del(this.CACHE_CONFIG_KEY);
    } catch (err) {
      this.logger.warn(`Redis delete cache config error: ${err}`);
    }

    this.logger.log(`[PointsConfig Updated] Earn Rate: ${updatedConfig.earnRatePercentage}%`);
    return updatedConfig;
  }

  /**
   * 3. Lấy thông tin tổng quan điểm của người dùng (Summary & Tier Progress)
   */
  async getUserPointsSummary(userId: number): Promise<LoyaltyPointsSummary> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        loyaltyPoints: true,
        membershipTier: true,
        totalSpentAccum: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    const config = await this.getPointsConfig();
    const currentPoints = user.loyaltyPoints || 0;
    const equivalentVnd = currentPoints * config.redeemRateVnd;
    const currentTier = user.membershipTier || MembershipTier.BRONZE;
    const totalSpent = Number(user.totalSpentAccum || 0);

    // Tính toán tiến trình thăng hạng
    const tierProgress = this.calculateTierProgress(currentTier, totalSpent, config);

    // Tính tổng điểm đã tích & đã tiêu
    const [earnedAggregate, redeemedAggregate] = await Promise.all([
      this.prisma.pointsLedger.aggregate({
        where: {
          userId,
          type: { in: [PointsTransactionType.EARN, PointsTransactionType.REFUND] },
        },
        _sum: { points: true },
      }),
      this.prisma.pointsLedger.aggregate({
        where: {
          userId,
          type: PointsTransactionType.REDEEM,
        },
        _sum: { points: true },
      }),
    ]);

    return {
      currentPoints,
      equivalentVnd,
      membershipTier: currentTier,
      tierProgress,
      totalPointsEarned: Math.abs(earnedAggregate._sum.points || 0),
      totalPointsRedeemed: Math.abs(redeemedAggregate._sum.points || 0),
      pointsExpiringSoon: null,
    };
  }

  /**
   * 4. Lấy lịch sử biến động điểm phân trang
   */
  async getUserPointsHistory(
    userId: number,
    query: PointsHistoryQueryDto,
  ): Promise<PointsHistoryResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.PointsLedgerWhereInput = {
      userId,
      ...(query.type && query.type !== 'ALL' ? { type: query.type } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.pointsLedger.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pointsLedger.count({ where: whereClause }),
    ]);

    return {
      items: items.map((it) => ({
        id: it.id,
        userId: it.userId,
        orderId: it.orderId,
        orderCode: it.orderCode,
        type: it.type,
        points: it.points,
        balanceBefore: it.balanceBefore,
        balanceAfter: it.balanceAfter,
        description: it.description,
        metadata: it.metadata,
        createdAt: it.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * 5. Tính toán xem trước khi áp dụng điểm tại Checkout (Preview Calculation)
   */
  async previewCheckoutPoints(
    userId: number,
    dto: PreviewPointsCheckoutDto,
  ): Promise<CheckoutPointsCalculationResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, loyaltyPoints: true, membershipTier: true },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng của bạn đang trống');
    }

    // Tính subtotal giỏ hàng
    let subtotal = 0;
    for (const item of cart.items) {
      if (item.product && item.product.isActive) {
        const price = Number(item.product.salePrice ?? item.product.price);
        subtotal += price * item.quantity;
      }
    }

    const config = await this.getPointsConfig();
    const availablePoints = user.loyaltyPoints || 0;
    const conversionRate = config.redeemRateVnd;

    // Giới hạn số điểm tối đa được phép dùng cho đơn hàng này
    const maxRedeemAmount = subtotal * (config.maxRedeemPercentage / 100);
    const maxPointsCanUse = Math.min(
      availablePoints,
      Math.floor(maxRedeemAmount / conversionRate),
    );

    const pointsToUse = Math.min(maxPointsCanUse, Math.max(0, dto.pointsToUse || 0));
    const discountAmount = pointsToUse * conversionRate;
    const remainingPayableAmount = Math.max(0, subtotal - discountAmount);
    const isFullyCovered = remainingPayableAmount === 0;

    // Dự kiến điểm nhận được
    const tierMultiplier = config.tierMultipliers[user.membershipTier] || 1.0;
    const estimatedPointsEarn = Math.floor(
      remainingPayableAmount * (config.earnRatePercentage / 100) * tierMultiplier / conversionRate * 10,
    );

    return {
      userAvailablePoints: availablePoints,
      maxPointsCanUse,
      conversionRate,
      pointsToUse,
      discountAmount,
      remainingPayableAmount,
      isFullyCovered,
      estimatedPointsEarn,
    };
  }

  /**
   * 6. Trừ điểm cho Đơn hàng trong Prisma Transaction (Redeem Points)
   */
  async redeemPointsForOrder(
    tx: Prisma.TransactionClient,
    userId: number,
    orderCode: string,
    pointsToUse: number,
    payableAmount: number,
    orderId?: number,
  ): Promise<{ pointsUsed: number; pointsDiscount: number }> {
    if (!pointsToUse || pointsToUse <= 0) {
      return { pointsUsed: 0, pointsDiscount: 0 };
    }

    const config = await this.getPointsConfig();
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, loyaltyPoints: true },
    });

    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản người dùng');
    }

    if (user.loyaltyPoints < pointsToUse) {
      throw new BadRequestException(
        `Số điểm sử dụng (${pointsToUse}) vượt quá số dư khả dụng (${user.loyaltyPoints})`,
      );
    }

    if (pointsToUse < config.minPointsToRedeem) {
      throw new BadRequestException(
        `Số điểm sử dụng tối thiểu mỗi lần là ${config.minPointsToRedeem} điểm`,
      );
    }

    const conversionRate = config.redeemRateVnd;
    const calculatedDiscount = pointsToUse * conversionRate;
    const actualDiscount = Math.min(payableAmount, calculatedDiscount);
    const actualPointsUsed = Math.ceil(actualDiscount / conversionRate);

    const balanceBefore = user.loyaltyPoints;
    const balanceAfter = balanceBefore - actualPointsUsed;

    // 1. Khấu trừ điểm tài khoản User
    await tx.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: balanceAfter,
      },
    });

    // 2. Ghi nhật ký PointsLedger
    await tx.pointsLedger.create({
      data: {
        userId,
        orderId: orderId || null,
        orderCode,
        type: PointsTransactionType.REDEEM,
        points: -actualPointsUsed,
        balanceBefore,
        balanceAfter,
        description: `Khấu trừ điểm thanh toán đơn hàng #${orderCode}`,
        metadata: {
          discountVnd: actualDiscount,
          conversionRate,
        },
      },
    });

    this.logger.log(
      `[Points Redeemed] User #${userId} used ${actualPointsUsed} points for order #${orderCode} (Saved: ${actualDiscount}đ)`,
    );

    return {
      pointsUsed: actualPointsUsed,
      pointsDiscount: actualDiscount,
    };
  }

  /**
   * 7. Tích điểm tự động khi Đơn hàng hoàn tất (DELIVERED hoặc PAID)
   */
  async earnPointsFromOrder(orderId: number): Promise<number> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order || !order.userId || !order.user) {
      return 0; // Guest hoặc không có order
    }

    if (order.isPointsEarned) {
      this.logger.debug(`[Points Skipped] Order #${order.orderCode} already earned points`);
      return 0;
    }

    const config = await this.getPointsConfig();
    const netAmount = Number(order.totalAmount) - Number(order.shippingFee);

    if (netAmount <= 0) {
      return 0;
    }

    const user = order.user;
    const tierMultiplier = config.tierMultipliers[user.membershipTier] || 1.0;
    const earnedPoints = Math.max(
      1,
      Math.floor(netAmount * (config.earnRatePercentage / 100) * tierMultiplier / config.redeemRateVnd * 10),
    );

    const balanceBefore = user.loyaltyPoints;
    const balanceAfter = balanceBefore + earnedPoints;
    const newTotalSpent = Number(user.totalSpentAccum) + netAmount;

    // Đánh giá thăng hạng
    const newTier = this.evaluateTierUpgrade(newTotalSpent, config);
    const hasTierUpgraded = newTier !== user.membershipTier;

    await this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật User
      await tx.user.update({
        where: { id: user.id },
        data: {
          loyaltyPoints: balanceAfter,
          totalSpentAccum: newTotalSpent,
          ...(hasTierUpgraded ? { membershipTier: newTier } : {}),
        },
      });

      // 2. Ghi nhật ký PointsLedger
      await tx.pointsLedger.create({
        data: {
          userId: user.id,
          orderId: order.id,
          orderCode: order.orderCode,
          type: PointsTransactionType.EARN,
          points: earnedPoints,
          balanceBefore,
          balanceAfter,
          description: `Tích lũy điểm từ đơn hàng #${order.orderCode}`,
          metadata: {
            netAmount,
            earnRate: config.earnRatePercentage,
            tierMultiplier,
          },
        },
      });

      // 3. Đánh dấu Order đã tích điểm
      await tx.order.update({
        where: { id: order.id },
        data: {
          isPointsEarned: true,
          pointsEarned: earnedPoints,
        },
      });
    });

    // 4. Phát thông báo Realtime In-App SSE
    await this.notificationsService.createNotification({
      userId: user.id,
      title: 'Tích điểm thành công! ⭐️',
      content: `Bạn đã nhận được +${earnedPoints} điểm thưởng từ đơn hàng #${order.orderCode}. Số dư mới: ${balanceAfter} điểm.`,
      type: NotificationType.POINTS_EARNED,
      orderCode: order.orderCode,
      actionUrl: '/profile?tab=points',
    });

    if (hasTierUpgraded) {
      await this.notificationsService.createNotification({
        userId: user.id,
        title: 'Chúc mừng thăng hạng thành viên! 🏆',
        content: `Chúc mừng bạn đã đạt hạng ${newTier}! Tận hưởng ưu đãi nhân ${config.tierMultipliers[newTier]}x điểm tích lũy cho các đơn hàng tiếp theo.`,
        type: NotificationType.TIER_UPGRADED,
        actionUrl: '/profile?tab=points',
      });
    }

    this.logger.log(
      `[Points Earned] User #${user.id} earned +${earnedPoints} points from order #${order.orderCode}`,
    );

    return earnedPoints;
  }

  /**
   * 8. Hoàn trả điểm khi Đơn hàng bị HỦY (CANCELLED)
   */
  async refundPointsFromOrder(orderId: number): Promise<number> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order || !order.userId || !order.user || order.pointsUsed <= 0) {
      return 0;
    }

    // Kiểm tra xem đơn hàng đã từng hoàn điểm chưa
    const existingRefund = await this.prisma.pointsLedger.findFirst({
      where: {
        orderId: order.id,
        type: PointsTransactionType.REFUND,
      },
    });

    if (existingRefund) {
      return 0; // Đã hoàn rồi
    }

    const pointsToRefund = order.pointsUsed;
    const user = order.user;
    const balanceBefore = user.loyaltyPoints;
    const balanceAfter = balanceBefore + pointsToRefund;

    await this.prisma.$transaction(async (tx) => {
      // 1. Trả lại điểm cho User
      await tx.user.update({
        where: { id: user.id },
        data: {
          loyaltyPoints: balanceAfter,
        },
      });

      // 2. Ghi nhật ký PointsLedger
      await tx.pointsLedger.create({
        data: {
          userId: user.id,
          orderId: order.id,
          orderCode: order.orderCode,
          type: PointsTransactionType.REFUND,
          points: pointsToRefund,
          balanceBefore,
          balanceAfter,
          description: `Hoàn trả ${pointsToRefund} điểm tích lũy do hủy đơn hàng #${order.orderCode}`,
        },
      });
    });

    // 3. Thông báo In-App
    await this.notificationsService.createNotification({
      userId: user.id,
      title: 'Hoàn điểm tích lũy ↺',
      content: `Đơn hàng #${order.orderCode} bị hủy. Hệ thống đã hoàn trả lại ${pointsToRefund} điểm tích lũy vào tài khoản của bạn.`,
      type: NotificationType.ORDER_STATUS_CHANGED,
      orderCode: order.orderCode,
      actionUrl: '/profile?tab=points',
    });

    this.logger.log(
      `[Points Refunded] User #${user.id} received +${pointsToRefund} refunded points for cancelled order #${order.orderCode}`,
    );

    return pointsToRefund;
  }

  /**
   * 9. Admin điều chỉnh điểm thủ công
   */
  async adjustPointsManual(dto: AdjustPointsDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true, loyaltyPoints: true },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const balanceBefore = user.loyaltyPoints || 0;
    const balanceAfter = Math.max(0, balanceBefore + dto.points);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: dto.userId },
        data: { loyaltyPoints: balanceAfter },
      });

      await tx.pointsLedger.create({
        data: {
          userId: dto.userId,
          type: PointsTransactionType.ADJUST,
          points: dto.points,
          balanceBefore,
          balanceAfter,
          description: `[Admin điều chỉnh] ${dto.reason}`,
        },
      });
    });

    await this.notificationsService.createNotification({
      userId: dto.userId,
      title: 'Cập nhật điểm thưởng từ Hệ thống ⚙️',
      content: `Tài khoản của bạn đã được ${dto.points >= 0 ? '+' : ''}${dto.points} điểm. Lý do: ${dto.reason}`,
      type: NotificationType.SYSTEM_ALERT,
      actionUrl: '/profile?tab=points',
    });

    return {
      userId: dto.userId,
      pointsAdjusted: dto.points,
      newBalance: balanceAfter,
    };
  }

  // --- Helpers ---
  private calculateTierProgress(
    tier: MembershipTier,
    totalSpent: number,
    config: PointsConfig,
  ): TierProgressInfo {
    const thresholds = config.tierThresholds;

    if (tier === MembershipTier.BRONZE) {
      const nextThreshold = thresholds.SILVER;
      const progress = Math.min(100, Math.round((totalSpent / nextThreshold) * 100));
      return {
        currentTierSpent: totalSpent,
        nextTierThreshold: nextThreshold,
        progressPercentage: progress,
        nextTier: MembershipTier.SILVER,
      };
    }

    if (tier === MembershipTier.SILVER) {
      const nextThreshold = thresholds.GOLD;
      const progress = Math.min(100, Math.round((totalSpent / nextThreshold) * 100));
      return {
        currentTierSpent: totalSpent,
        nextTierThreshold: nextThreshold,
        progressPercentage: progress,
        nextTier: MembershipTier.GOLD,
      };
    }

    if (tier === MembershipTier.GOLD) {
      const nextThreshold = thresholds.DIAMOND;
      const progress = Math.min(100, Math.round((totalSpent / nextThreshold) * 100));
      return {
        currentTierSpent: totalSpent,
        nextTierThreshold: nextThreshold,
        progressPercentage: progress,
        nextTier: MembershipTier.DIAMOND,
      };
    }

    return {
      currentTierSpent: totalSpent,
      nextTierThreshold: thresholds.DIAMOND,
      progressPercentage: 100,
      nextTier: null,
    };
  }

  private evaluateTierUpgrade(
    totalSpent: number,
    config: PointsConfig,
  ): MembershipTier {
    const thresholds = config.tierThresholds;
    if (totalSpent >= thresholds.DIAMOND) return MembershipTier.DIAMOND;
    if (totalSpent >= thresholds.GOLD) return MembershipTier.GOLD;
    if (totalSpent >= thresholds.SILVER) return MembershipTier.SILVER;
    return MembershipTier.BRONZE;
  }
}
