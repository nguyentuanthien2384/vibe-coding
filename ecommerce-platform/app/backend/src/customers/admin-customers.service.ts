import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import {
  CustomerQueryDto,
  CustomerStatusFilter,
  CustomerTypeFilter,
  CustomerSortBy,
} from './dto/customer-query.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerStatusDto, CustomerAccountStatus } from './dto/update-customer-status.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerOrderQueryDto } from './dto/customer-order-query.dto';
import { AddCustomerAddressDto } from './dto/add-customer-address.dto';
import {
  CustomerAddressItem,
  CustomerDetailResponse,
  CustomerListItem,
  CustomerListResponse,
  CustomerMutateResponse,
  CustomerOrdersResponse,
  CustomerOrderSummaryItem,
} from './interfaces/customer.interface';

@Injectable()
export class AdminCustomersService {
  private readonly logger = new Logger(AdminCustomersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Lấy danh sách khách hàng (Thành viên + Vãng lai) cho Admin Dashboard
   * Đảm bảo 100% tất cả đơn hàng (Guest & Registered) đều được liên kết hiển thị.
   */
  async findAll(dto: CustomerQueryDto): Promise<CustomerListResponse> {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const search = dto.query?.trim() || '';
    const typeFilter = dto.type || CustomerTypeFilter.ALL;
    const statusFilter = dto.status || CustomerStatusFilter.ALL;
    const sortBy = dto.sortBy || CustomerSortBy.CREATED_AT_DESC;

    // 1. Lấy tất cả tài khoản Khách hàng Thành viên (User với role = CUSTOMER)
    const registeredUsersWhere: any = {
      role: 'CUSTOMER',
    };

    if (statusFilter === CustomerStatusFilter.ACTIVE) {
      registeredUsersWhere.isActive = true;
    } else if (
      statusFilter === CustomerStatusFilter.BLOCKED ||
      statusFilter === CustomerStatusFilter.INACTIVE
    ) {
      registeredUsersWhere.isActive = false;
    }

    if (search) {
      registeredUsersWhere.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const registeredUsers = await this.prisma.user.findMany({
      where: registeredUsersWhere,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        notes: true,
        createdAt: true,
      },
    });

    const registeredUserIds = new Set(registeredUsers.map((u) => u.id));
    const registeredUserEmails = new Set(
      registeredUsers.map((u) => u.email.toLowerCase().trim()),
    );

    // Tính chỉ số tài chính cho từng Registered User (khớp theo userId HOẶC email)
    const registeredListItems: CustomerListItem[] = await Promise.all(
      registeredUsers.map(async (user) => {
        const orderAgg = await this.prisma.order.aggregate({
          where: {
            OR: [
              { userId: user.id },
              { customerEmail: { equals: user.email } },
            ],
            orderStatus: { not: 'CANCELLED' },
          },
          _count: { id: true },
          _sum: { totalAmount: true },
          _max: { createdAt: true },
        });

        return {
          id: user.id.toString(),
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || 'Chưa cập nhật',
          avatarUrl: user.avatarUrl,
          type: 'REGISTERED',
          status: user.isActive ? 'ACTIVE' : 'BLOCKED',
          totalOrders: orderAgg._count.id || 0,
          totalSpent: orderAgg._sum.totalAmount
            ? Number(orderAgg._sum.totalAmount)
            : 0,
          createdAt: user.createdAt.toISOString(),
          lastOrderAt: orderAgg._max.createdAt
            ? orderAgg._max.createdAt.toISOString()
            : null,
          notes: user.notes || null,
        };
      }),
    );

    // 2. Lấy tất cả đơn hàng Khách vãng lai (GUEST)
    const allOrders = await this.prisma.order.findMany({
      select: {
        id: true,
        userId: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        totalAmount: true,
        orderStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Lọc ra các đơn hàng được coi là của Khách vãng lai
    const guestOrders = allOrders.filter((ord) => {
      const emailClean = ord.customerEmail ? ord.customerEmail.toLowerCase().trim() : '';
      const isRegisteredUser =
        (ord.userId && registeredUserIds.has(ord.userId)) ||
        (emailClean && registeredUserEmails.has(emailClean));
      return !isRegisteredUser;
    });

    // Gom nhóm đơn hàng Khách vãng lai theo email (hoặc số điện thoại nếu email rỗng)
    const guestMap = new Map<string, CustomerListItem>();
    for (const order of guestOrders) {
      const emailClean = order.customerEmail ? order.customerEmail.toLowerCase().trim() : '';
      const phoneClean = order.customerPhone ? order.customerPhone.trim() : '';
      const identifier = emailClean || phoneClean || `order-${order.id}`;
      const key = `guest:${identifier}`;

      // Nếu có tìm kiếm từ khóa search ➔ Kiểm tra xem đơn vãng lai có khớp search không
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          order.customerName.toLowerCase().includes(searchLower) ||
          emailClean.includes(searchLower) ||
          phoneClean.includes(searchLower);
        if (!matchesSearch) {
          continue;
        }
      }

      if (!guestMap.has(key)) {
        guestMap.set(key, {
          id: key,
          fullName: `${order.customerName} (Khách vãng lai)`,
          email: order.customerEmail || 'Chưa cung cấp',
          phone: order.customerPhone || 'Chưa cập nhật',
          avatarUrl: null,
          type: 'GUEST',
          status: 'ACTIVE',
          totalOrders: 0,
          totalSpent: 0,
          createdAt: order.createdAt.toISOString(),
          lastOrderAt: order.createdAt.toISOString(),
        });
      }

      const item = guestMap.get(key)!;
      if (order.orderStatus !== 'CANCELLED') {
        item.totalOrders += 1;
        item.totalSpent += Number(order.totalAmount);
      }
      if (new Date(order.createdAt) < new Date(item.createdAt)) {
        item.createdAt = order.createdAt.toISOString();
      }
      if (new Date(order.createdAt) > new Date(item.lastOrderAt || 0)) {
        item.lastOrderAt = order.createdAt.toISOString();
      }
    }

    const guestListItems: CustomerListItem[] = Array.from(guestMap.values());

    // 3. Kết hợp & Lọc theo Type
    let combinedItems: CustomerListItem[] = [];
    if (typeFilter === CustomerTypeFilter.REGISTERED) {
      combinedItems = registeredListItems;
    } else if (typeFilter === CustomerTypeFilter.GUEST) {
      combinedItems = guestListItems;
    } else {
      combinedItems = [...registeredListItems, ...guestListItems];
    }

    // Lọc theo Status đối với Guest (GUEST mặc định là ACTIVE)
    if (statusFilter !== CustomerStatusFilter.ALL) {
      combinedItems = combinedItems.filter((i) => i.status === statusFilter);
    }

    // 4. Sắp xếp danh sách
    combinedItems.sort((a, b) => {
      if (sortBy === CustomerSortBy.CREATED_AT_DESC) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === CustomerSortBy.CREATED_AT_ASC) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === CustomerSortBy.TOTAL_SPENT_DESC) {
        return b.totalSpent - a.totalSpent;
      }
      if (sortBy === CustomerSortBy.TOTAL_ORDERS_DESC) {
        return b.totalOrders - a.totalOrders;
      }
      if (sortBy === CustomerSortBy.NAME_ASC) {
        return a.fullName.localeCompare(b.fullName, 'vi');
      }
      return 0;
    });

    // 5. Phân trang
    const totalItems = combinedItems.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = combinedItems.slice(startIndex, startIndex + limit);

    return {
      statusCode: 200,
      message: 'Lấy danh sách khách hàng thành công',
      data: {
        items: paginatedItems,
        meta: {
          page,
          limit,
          totalItems,
          totalPages,
          stats: {
            totalCustomers: totalItems,
            registeredCount: registeredListItems.length,
            guestCount: guestListItems.length,
          },
        },
      },
    };
  }

  /**
   * Lấy chi tiết thông tin khách hàng (Fail-safe, hỗ trợ Ghi chú & Địa chỉ cho cả Guest)
   */
  async findOne(idStr: string): Promise<CustomerDetailResponse> {
    const rawId = decodeURIComponent(idStr);

    if (rawId.startsWith('guest:')) {
      const targetIdentifier = rawId.replace('guest:', '').trim().toLowerCase();

      // Đọc ghi chú nội bộ của khách vãng lai từ Redis
      const guestNotes = await this.redisService.get(`customer:notes:guest:${targetIdentifier}`);

      // Đọc sổ địa chỉ bổ sung của khách vãng lai từ Redis
      const guestAddressesRaw = await this.redisService.get(`customer:addresses:guest:${targetIdentifier}`);
      let customGuestAddresses: CustomerAddressItem[] = [];
      if (guestAddressesRaw) {
        try {
          customGuestAddresses = JSON.parse(guestAddressesRaw);
        } catch {
          customGuestAddresses = [];
        }
      }

      // Lấy tất cả các đơn hàng từ DB để khớp thông minh theo JS Memory
      const allOrders = await this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const guestOrders = allOrders.filter((o) => {
        const emailClean = (o.customerEmail || '').toLowerCase().trim();
        const phoneClean = (o.customerPhone || '').trim();
        const orderIdStr = `order-${o.id}`;

        return (
          (targetIdentifier.startsWith('order-') && orderIdStr === targetIdentifier) ||
          (emailClean && emailClean === targetIdentifier) ||
          (phoneClean && phoneClean === targetIdentifier) ||
          (emailClean && emailClean.includes(targetIdentifier)) ||
          (phoneClean && phoneClean.includes(targetIdentifier))
        );
      });

      if (guestOrders.length === 0) {
        return {
          statusCode: 200,
          message: 'Lấy thông tin chi tiết khách vãng lai thành công',
          data: {
            id: idStr,
            fullName: `${targetIdentifier} (Khách vãng lai)`,
            email: targetIdentifier.includes('@') ? targetIdentifier : 'Chưa cung cấp',
            phone: targetIdentifier.includes('@') ? 'Chưa cập nhật' : targetIdentifier,
            avatarUrl: null,
            type: 'GUEST',
            status: 'ACTIVE',
            totalOrders: 0,
            totalSpent: 0,
            averageOrderValue: 0,
            createdAt: new Date().toISOString(),
            lastOrderAt: null,
            registeredAt: null,
            addresses: customGuestAddresses,
            notes: guestNotes || 'Khách hàng vãng lai đặt mua trực tiếp không đăng ký tài khoản',
          },
        };
      }

      const firstOrder = guestOrders[guestOrders.length - 1];
      const latestOrder = guestOrders[0];

      let totalSpent = 0;
      let totalOrders = 0;
      for (const order of guestOrders) {
        if (order.orderStatus !== 'CANCELLED') {
          totalOrders += 1;
          totalSpent += Number(order.totalAmount);
        }
      }

      const addressesMap = new Map<string, CustomerAddressItem>();

      // Đưa địa chỉ thủ công từ Redis lên đầu (nếu có)
      customGuestAddresses.forEach((addr) => {
        const addrKey = `${addr.provinceName}-${addr.districtName}-${addr.wardName}-${addr.detailAddress}`;
        addressesMap.set(addrKey, addr);
      });

      // Đưa các địa chỉ từ đơn hàng DB vào sổ địa chỉ
      guestOrders.forEach((o, index) => {
        const addrKey = `${o.provinceName}-${o.districtName}-${o.wardName}-${o.detailAddress}`;
        if (!addressesMap.has(addrKey)) {
          addressesMap.set(addrKey, {
            id: o.id,
            recipientName: o.customerName,
            phone: o.customerPhone,
            provinceName: o.provinceName,
            districtName: o.districtName,
            wardName: o.wardName,
            detailAddress: o.detailAddress,
            isDefault: index === 0 && customGuestAddresses.length === 0,
          });
        }
      });

      const averageOrderValue =
        totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

      return {
        statusCode: 200,
        message: 'Lấy thông tin chi tiết khách vãng lai thành công',
        data: {
          id: idStr,
          fullName: `${latestOrder.customerName} (Khách vãng lai)`,
          email: latestOrder.customerEmail || 'Chưa cung cấp',
          phone: latestOrder.customerPhone || 'Chưa cập nhật',
          avatarUrl: null,
          type: 'GUEST',
          status: 'ACTIVE',
          totalOrders,
          totalSpent,
          averageOrderValue,
          createdAt: firstOrder.createdAt.toISOString(),
          lastOrderAt: latestOrder.createdAt.toISOString(),
          registeredAt: null,
          addresses: Array.from(addressesMap.values()),
          notes: guestNotes || 'Khách hàng vãng lai đặt mua trực tiếp không đăng ký tài khoản',
        },
      };
    }

    // Registered Customer
    const userId = parseInt(rawId, 10);
    if (!isNaN(userId)) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          addresses: {
            orderBy: { isDefault: 'desc' },
          },
        },
      });

      if (user) {
        const orderAgg = await this.prisma.order.aggregate({
          where: {
            OR: [
              { userId: user.id },
              { customerEmail: { equals: user.email } },
            ],
            orderStatus: { not: 'CANCELLED' },
          },
          _count: { id: true },
          _sum: { totalAmount: true },
          _max: { createdAt: true },
        });

        const totalOrders = orderAgg._count.id || 0;
        const totalSpent = orderAgg._sum.totalAmount
          ? Number(orderAgg._sum.totalAmount)
          : 0;
        const averageOrderValue =
          totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

        const addressesFormatted: CustomerAddressItem[] = (user.addresses || []).map((a) => ({
          id: a.id,
          recipientName: a.recipientName,
          phone: a.phone,
          provinceCode: a.provinceCode,
          provinceName: a.provinceName,
          districtCode: a.districtCode,
          districtName: a.districtName,
          wardCode: a.wardCode,
          wardName: a.wardName,
          detailAddress: a.detailAddress,
          isDefault: a.isDefault,
        }));

        return {
          statusCode: 200,
          message: 'Lấy thông tin chi tiết khách hàng thành công',
          data: {
            id: user.id.toString(),
            fullName: user.fullName,
            email: user.email,
            phone: user.phone || 'Chưa cập nhật',
            avatarUrl: user.avatarUrl,
            type: user.role === 'CUSTOMER' ? 'REGISTERED' : 'GUEST',
            status: user.isActive ? 'ACTIVE' : 'BLOCKED',
            totalOrders,
            totalSpent,
            averageOrderValue,
            createdAt: user.createdAt.toISOString(),
            registeredAt: user.createdAt.toISOString(),
            lastOrderAt: orderAgg._max.createdAt
              ? orderAgg._max.createdAt.toISOString()
              : null,
            addresses: addressesFormatted,
            notes: user.notes || null,
          },
        };
      }
    }

    // Fallback nếu không khớp userId hay guest: ➔ Tìm đơn hàng khớp theo string rawId
    const fallbackOrders = await this.prisma.order.findMany({
      where: {
        OR: [
          { customerEmail: { contains: rawId } },
          { customerPhone: { contains: rawId } },
          { customerName: { contains: rawId } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (fallbackOrders.length > 0) {
      const firstOrder = fallbackOrders[fallbackOrders.length - 1];
      const latestOrder = fallbackOrders[0];
      let totalSpent = 0;
      let totalOrders = 0;
      for (const order of fallbackOrders) {
        if (order.orderStatus !== 'CANCELLED') {
          totalOrders += 1;
          totalSpent += Number(order.totalAmount);
        }
      }

      return {
        statusCode: 200,
        message: 'Lấy thông tin chi tiết khách hàng thành công',
        data: {
          id: idStr,
          fullName: `${latestOrder.customerName} (Khách vãng lai)`,
          email: latestOrder.customerEmail || 'Chưa cung cấp',
          phone: latestOrder.customerPhone || 'Chưa cập nhật',
          avatarUrl: null,
          type: 'GUEST',
          status: 'ACTIVE',
          totalOrders,
          totalSpent,
          averageOrderValue: totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0,
          createdAt: firstOrder.createdAt.toISOString(),
          lastOrderAt: latestOrder.createdAt.toISOString(),
          registeredAt: null,
          addresses: [],
          notes: null,
        },
      };
    }

    throw new NotFoundException(`Không tìm thấy thông tin khách hàng: ${idStr}`);
  }

  /**
   * Tạo mới khách hàng thủ công bởi Admin (Mật khẩu tuân thủ rule RegisterDto)
   */
  async create(dto: CreateCustomerDto): Promise<CustomerMutateResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    // Mật khẩu mặc định nếu để trống: Password123 (chứa chữ cái và số, độ dài >= 6)
    const rawPassword = dto.password?.trim() || 'Password123';
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    const newUser = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone.trim(),
        password: hashedPassword,
        role: 'CUSTOMER',
        isActive: true,
      },
    });

    if (dto.address) {
      await this.prisma.address.create({
        data: {
          userId: newUser.id,
          recipientName: dto.address.recipientName.trim(),
          phone: dto.address.phone.trim(),
          provinceCode: dto.address.provinceCode || '79',
          provinceName: dto.address.provinceName.trim(),
          districtCode: dto.address.districtCode || '760',
          districtName: dto.address.districtName.trim(),
          wardCode: dto.address.wardCode || '26740',
          wardName: dto.address.wardName.trim(),
          detailAddress: dto.address.detailAddress.trim(),
          isDefault: true,
        },
      });
    }

    await this.redisService.del('cache:v1:admin:customers:stats');

    return {
      statusCode: 201,
      message: 'Tạo tài khoản khách hàng mới thành công',
      data: {
        id: newUser.id.toString(),
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt.toISOString(),
      },
    };
  }

  /**
   * Cập nhật trạng thái tài khoản khách hàng (ACTIVE / BLOCKED / INACTIVE)
   */
  async updateStatus(
    idStr: string,
    dto: UpdateCustomerStatusDto,
  ): Promise<CustomerMutateResponse> {
    const rawId = decodeURIComponent(idStr);
    const userId = parseInt(rawId, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Chỉ hỗ trợ cập nhật trạng thái tài khoản khách hàng thành viên');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy tài khoản khách hàng với ID: ${userId}`);
    }

    const isActive = dto.status === CustomerAccountStatus.ACTIVE;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    if (dto.status === CustomerAccountStatus.BLOCKED) {
      await this.redisService.delByPattern(`auth:refresh:${userId}:*`);
      await this.redisService.setEx(`auth:user_blocked:${userId}`, 900, 'true');
    }

    await this.redisService.del('cache:v1:admin:customers:stats');

    return {
      statusCode: 200,
      message: `Cập nhật trạng thái tài khoản khách hàng sang [${dto.status}] thành công`,
      data: {
        id: updatedUser.id.toString(),
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        status: dto.status,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    };
  }

  /**
   * Cập nhật thông tin cá nhân cơ bản & Ghi chú nội bộ (Cho cả Thành viên và Vãng lai)
   */
  async update(
    idStr: string,
    dto: UpdateCustomerDto,
  ): Promise<CustomerMutateResponse> {
    const rawId = decodeURIComponent(idStr);

    if (rawId.startsWith('guest:')) {
      const targetIdentifier = rawId.replace('guest:', '').trim().toLowerCase();

      // 1. Lưu ghi chú nội bộ của khách vãng lai vào Redis
      if (dto.notes !== undefined) {
        await this.redisService.setEx(
          `customer:notes:guest:${targetIdentifier}`,
          86400 * 365,
          dto.notes,
        );
      }

      // 2. Cập nhật thông tin trong các đơn hàng của khách vãng lai nếu có thay đổi
      const orderUpdateData: { customerName?: string; customerEmail?: string; customerPhone?: string } = {};
      if (dto.fullName && dto.fullName.trim()) {
        orderUpdateData.customerName = dto.fullName.trim().replace(/\s*\(Khách vãng lai\)$/i, '');
      }
      if (dto.email && dto.email.trim()) {
        orderUpdateData.customerEmail = dto.email.trim().toLowerCase();
      }
      if (dto.phone && dto.phone.trim()) {
        orderUpdateData.customerPhone = dto.phone.trim();
      }

      if (Object.keys(orderUpdateData).length > 0) {
        if (targetIdentifier.startsWith('order-')) {
          const orderId = parseInt(targetIdentifier.replace('order-', ''), 10);
          if (!isNaN(orderId)) {
            await this.prisma.order.update({
              where: { id: orderId },
              data: orderUpdateData,
            });
          }
        } else {
          await this.prisma.order.updateMany({
            where: {
              OR: [
                { customerEmail: { equals: targetIdentifier } },
                { customerPhone: { equals: targetIdentifier } },
              ],
            },
            data: orderUpdateData,
          });
        }

        // Nếu email hoặc SĐT thay đổi, di chuyển notes sang key mới nếu cần
        const newIdentifier = (orderUpdateData.customerEmail || orderUpdateData.customerPhone || targetIdentifier).toLowerCase();
        if (newIdentifier !== targetIdentifier) {
          const existingNotes = dto.notes !== undefined
            ? dto.notes
            : await this.redisService.get(`customer:notes:guest:${targetIdentifier}`);
          if (existingNotes) {
            await this.redisService.setEx(`customer:notes:guest:${newIdentifier}`, 86400 * 365, existingNotes);
          }
        }
      }

      await this.redisService.del('cache:v1:admin:customers:stats');

      return {
        statusCode: 200,
        message: 'Cập nhật thông tin khách vãng lai thành công',
        data: {
          id: idStr,
          fullName: dto.fullName || targetIdentifier,
          email: dto.email || targetIdentifier,
          phone: dto.phone || 'Chưa cập nhật',
          notes: dto.notes,
        },
      };
    }

    // Registered User Update
    const userId = parseInt(rawId, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('ID khách hàng không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy tài khoản khách hàng với ID: ${userId}`);
    }

    if (dto.email && dto.email.trim().toLowerCase() !== user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: dto.email.trim().toLowerCase() },
      });
      if (emailExists) {
        throw new ConflictException('Email này đã được sử dụng bởi tài khoản khác');
      }
    }

    const updateData: any = {};
    if (dto.fullName) updateData.fullName = dto.fullName.trim();
    if (dto.phone) updateData.phone = dto.phone.trim();
    if (dto.email) updateData.email = dto.email.trim().toLowerCase();
    if (dto.notes !== undefined) updateData.notes = dto.notes.trim();
    if (dto.status !== undefined) {
      updateData.isActive = dto.status === CustomerAccountStatus.ACTIVE;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    if (dto.status === CustomerAccountStatus.BLOCKED) {
      await this.redisService.delByPattern(`auth:refresh:${userId}:*`);
      await this.redisService.setEx(`auth:user_blocked:${userId}`, 900, 'true');
    }

    await this.redisService.del('cache:v1:admin:customers:stats');

    return {
      statusCode: 200,
      message: 'Cập nhật thông tin khách hàng thành công',
      data: {
        id: updatedUser.id.toString(),
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        status: updatedUser.isActive ? 'ACTIVE' : 'BLOCKED',
        isActive: updatedUser.isActive,
        notes: updatedUser.notes,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    };
  }

  /**
   * Lấy lịch sử đơn hàng của khách hàng có phân trang & tìm kiếm (Fail-safe)
   */
  async getCustomerOrders(
    idStr: string,
    dto: CustomerOrderQueryDto,
  ): Promise<CustomerOrdersResponse> {
    const page = dto.page || 1;
    const limit = dto.limit || 5;
    const search = dto.search?.trim() || '';
    const statusFilter = dto.status;
    const rawId = decodeURIComponent(idStr);

    let matchedOrders: any[] = [];

    if (rawId.startsWith('guest:')) {
      const targetIdentifier = rawId.replace('guest:', '').trim().toLowerCase();

      const allOrders = await this.prisma.order.findMany({
        include: {
          orderItems: {
            select: { id: true, quantity: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      matchedOrders = allOrders.filter((o) => {
        const emailClean = (o.customerEmail || '').toLowerCase().trim();
        const phoneClean = (o.customerPhone || '').trim();
        const orderIdStr = `order-${o.id}`;

        return (
          (targetIdentifier.startsWith('order-') && orderIdStr === targetIdentifier) ||
          (emailClean && emailClean === targetIdentifier) ||
          (phoneClean && phoneClean === targetIdentifier) ||
          (emailClean && emailClean.includes(targetIdentifier)) ||
          (phoneClean && phoneClean.includes(targetIdentifier))
        );
      });
    } else {
      const userId = parseInt(rawId, 10);
      if (!isNaN(userId)) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const ordersWhere: any = {
          OR: [
            { userId },
            ...(user?.email ? [{ customerEmail: { equals: user.email } }] : []),
          ],
        };

        matchedOrders = await this.prisma.order.findMany({
          where: ordersWhere,
          include: {
            orderItems: {
              select: { id: true, quantity: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      }
    }

    if (statusFilter) {
      matchedOrders = matchedOrders.filter((o) => o.orderStatus === statusFilter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      matchedOrders = matchedOrders.filter((o) =>
        o.orderCode.toLowerCase().includes(searchLower),
      );
    }

    const totalItems = matchedOrders.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const paginatedOrders = matchedOrders.slice((page - 1) * limit, page * limit);

    const items: CustomerOrderSummaryItem[] = paginatedOrders.map((o) => ({
      id: o.id,
      orderCode: o.orderCode,
      createdAt: o.createdAt.toISOString(),
      totalAmount: Number(o.totalAmount),
      itemsCount: o.orderItems.reduce((acc: number, item: any) => acc + item.quantity, 0),
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
    }));

    return {
      statusCode: 200,
      message: 'Lấy lịch sử đơn hàng của khách hàng thành công',
      data: {
        items,
        meta: {
          page,
          limit,
          totalItems,
          totalPages,
        },
      },
    };
  }

  /**
   * Thêm địa chỉ mới cho khách hàng (Hỗ trợ cả Khách thành viên & Khách vãng lai)
   */
  async addAddress(
    idStr: string,
    dto: AddCustomerAddressDto,
  ): Promise<CustomerMutateResponse> {
    const rawId = decodeURIComponent(idStr);

    if (rawId.startsWith('guest:')) {
      const targetIdentifier = rawId.replace('guest:', '').trim().toLowerCase();

      const storedAddressesRaw = await this.redisService.get(
        `customer:addresses:guest:${targetIdentifier}`,
      );
      let guestAddresses: CustomerAddressItem[] = [];
      if (storedAddressesRaw) {
        try {
          guestAddresses = JSON.parse(storedAddressesRaw);
        } catch {
          guestAddresses = [];
        }
      }

      if (dto.isDefault) {
        guestAddresses.forEach((a) => (a.isDefault = false));
      }

      const newAddress: CustomerAddressItem = {
        id: Date.now(),
        recipientName: dto.recipientName.trim(),
        phone: dto.phone.trim(),
        provinceCode: dto.provinceCode || '79',
        provinceName: dto.provinceName.trim(),
        districtCode: dto.districtCode || '760',
        districtName: dto.districtName.trim(),
        wardCode: dto.wardCode || '26740',
        wardName: dto.wardName.trim(),
        detailAddress: dto.detailAddress.trim(),
        isDefault: dto.isDefault ?? (guestAddresses.length === 0),
      };

      guestAddresses.unshift(newAddress);

      await this.redisService.setEx(
        `customer:addresses:guest:${targetIdentifier}`,
        86400 * 365,
        JSON.stringify(guestAddresses),
      );

      return {
        statusCode: 201,
        message: 'Thêm địa chỉ nhận hàng cho khách vãng lai thành công',
        data: newAddress,
      };
    }

    // Registered Customer Address Creation
    const userId = parseInt(rawId, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('ID khách hàng không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy tài khoản khách hàng với ID: ${userId}`);
    }

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        userId,
        recipientName: dto.recipientName.trim(),
        phone: dto.phone.trim(),
        provinceCode: dto.provinceCode || '79',
        provinceName: dto.provinceName.trim(),
        districtCode: dto.districtCode || '760',
        districtName: dto.districtName.trim(),
        wardCode: dto.wardCode || '26740',
        wardName: dto.wardName.trim(),
        detailAddress: dto.detailAddress.trim(),
        isDefault: dto.isDefault ?? false,
      },
    });

    return {
      statusCode: 201,
      message: 'Thêm địa chỉ nhận hàng thành công',
      data: address,
    };
  }

  /**
   * Đặt địa chỉ mặc định cho khách hàng (Hỗ trợ cả Thành viên và Vãng lai)
   */
  async setDefaultAddress(
    idStr: string,
    addressId: number,
  ): Promise<CustomerMutateResponse> {
    const rawId = decodeURIComponent(idStr);

    if (rawId.startsWith('guest:')) {
      const targetIdentifier = rawId.replace('guest:', '').trim().toLowerCase();
      const storedAddressesRaw = await this.redisService.get(
        `customer:addresses:guest:${targetIdentifier}`,
      );
      if (storedAddressesRaw) {
        try {
          const addresses: CustomerAddressItem[] = JSON.parse(storedAddressesRaw);
          addresses.forEach((a) => {
            a.isDefault = a.id === addressId;
          });
          await this.redisService.setEx(
            `customer:addresses:guest:${targetIdentifier}`,
            86400 * 365,
            JSON.stringify(addresses),
          );
        } catch {}
      }
      return {
        statusCode: 200,
        message: 'Đặt địa chỉ mặc định cho khách vãng lai thành công',
        data: { addressId, isDefault: true },
      };
    }

    const userId = parseInt(rawId, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Không tìm thấy địa chỉ thuộc khách hàng này');
    }

    await this.prisma.$transaction([
      this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      this.prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    return {
      statusCode: 200,
      message: 'Đặt địa chỉ mặc định thành công',
      data: { addressId, isDefault: true },
    };
  }

  /**
   * Xóa địa chỉ của khách hàng (Hỗ trợ cả Thành viên và Vãng lai)
   */
  async deleteAddress(
    idStr: string,
    addressId: number,
  ): Promise<CustomerMutateResponse> {
    const rawId = decodeURIComponent(idStr);

    if (rawId.startsWith('guest:')) {
      const targetIdentifier = rawId.replace('guest:', '').trim().toLowerCase();
      const storedAddressesRaw = await this.redisService.get(
        `customer:addresses:guest:${targetIdentifier}`,
      );
      if (storedAddressesRaw) {
        try {
          let addresses: CustomerAddressItem[] = JSON.parse(storedAddressesRaw);
          addresses = addresses.filter((a) => a.id !== addressId);
          await this.redisService.setEx(
            `customer:addresses:guest:${targetIdentifier}`,
            86400 * 365,
            JSON.stringify(addresses),
          );
        } catch {}
      }
      return {
        statusCode: 200,
        message: 'Xóa địa chỉ nhận hàng của khách vãng lai thành công',
        data: { addressId },
      };
    }

    const userId = parseInt(rawId, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Không tìm thấy địa chỉ thuộc khách hàng này');
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    return {
      statusCode: 200,
      message: 'Xóa địa chỉ nhận hàng thành công',
      data: { addressId },
    };
  }
}
