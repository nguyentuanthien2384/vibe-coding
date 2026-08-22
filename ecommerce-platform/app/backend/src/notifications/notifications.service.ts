import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationType } from '@prisma/client';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface RealtimeNotificationPayload {
  userId: number;
  notification: {
    id: number;
    userId: number;
    title: string;
    content: string;
    type: NotificationType;
    orderCode: string | null;
    actionUrl: string | null;
    isRead: boolean;
    createdAt: Date;
  };
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly notificationSubject = new Subject<RealtimeNotificationPayload>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo thông báo đẩy In-App trong DB và phát tín hiệu Realtime qua RxJS SSE Stream cho 1 user
   */
  async createNotification(params: {
    userId: number;
    title: string;
    content: string;
    type?: NotificationType;
    orderCode?: string;
    actionUrl?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        content: params.content,
        type: params.type || NotificationType.ORDER_STATUS_CHANGED,
        orderCode: params.orderCode,
        actionUrl: params.actionUrl,
        isRead: false,
      },
    });

    this.logger.log(
      `[Realtime Push Notification] Emitted to User #${params.userId}: ${params.title}`,
    );

    // Broadcast event qua SSE stream cho client đúng userId
    this.notificationSubject.next({
      userId: params.userId,
      notification,
    });

    return notification;
  }

  /**
   * Broadcast thông báo đẩy tới TOÀN BỘ tài khoản Quản trị (Role: ADMIN, STAFF)
   */
  async broadcastToAdmins(params: {
    title: string;
    content: string;
    type: NotificationType;
    orderCode?: string;
    actionUrl?: string;
  }) {
    try {
      const adminUsers = await this.prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'STAFF'] },
          isActive: true,
        },
        select: { id: true, email: true },
      });

      if (adminUsers.length === 0) return;

      const createdNotifications = await Promise.all(
        adminUsers.map(async (admin) => {
          const notif = await this.prisma.notification.create({
            data: {
              userId: admin.id,
              title: params.title,
              content: params.content,
              type: params.type,
              orderCode: params.orderCode,
              actionUrl: params.actionUrl,
              isRead: false,
            },
          });

          // Broadcast qua SSE realtime
          this.notificationSubject.next({
            userId: admin.id,
            notification: notif,
          });

          return notif;
        }),
      );

      this.logger.log(
        `[Admin Notification Broadcast] Sent "${params.title}" to ${adminUsers.length} admin/staff accounts.`,
      );

      return createdNotifications;
    } catch (error) {
      this.logger.error('[Admin Notification Broadcast Error]', error);
    }
  }

  /**
   * Observable Stream SSE lọc thông báo thời gian thực dành riêng cho userId
   */
  getSseStream(userId: number): Observable<{ data: any }> {
    return this.notificationSubject.asObservable().pipe(
      filter((event) => event.userId === userId),
      map((event) => ({ data: event.notification })),
    );
  }

  /**
   * Lấy danh sách thông báo In-App cá nhân (Có phân trang, lọc & đếm chưa đọc)
   */
  async getUserNotifications(userId: number, queryDto: NotificationQueryDto) {
    const page = Number(queryDto.page) || 1;
    const limit = Number(queryDto.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (queryDto.type) {
      where.type = queryDto.type;
    }

    if (typeof queryDto.isRead === 'boolean') {
      where.isRead = queryDto.isRead;
    }

    const [items, totalItems, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      statusCode: 200,
      message: 'Lấy danh sách thông báo thành công',
      data: {
        items,
        unreadCount,
        pagination: {
          page,
          limit,
          total: totalItems,
          totalPages: Math.ceil(totalItems / limit) || 1,
        },
      },
    };
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo hoặc bạn không có quyền');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return {
      statusCode: 200,
      message: 'Đã đánh dấu thông báo là đã đọc',
      data: updated,
    };
  }

  /**
   * Đánh dấu tất cả thông báo của User là đã đọc
   */
  async markAllAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return {
      statusCode: 200,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
    };
  }
}
