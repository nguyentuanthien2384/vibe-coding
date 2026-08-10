import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách toàn bộ địa chỉ giao hàng của người dùng (ưu tiên mặc định trước)
   */
  async getAddresses(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Lấy chi tiết 1 địa chỉ theo ID
   */
  async getAddressById(userId: number, addressId: number) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException(`Không tìm thấy địa chỉ #${addressId} của bạn`);
    }

    return address;
  }

  /**
   * Tạo địa chỉ giao hàng mới
   */
  async createAddress(userId: number, dto: CreateAddressDto) {
    const existingCount = await this.prisma.address.count({
      where: { userId },
    });

    // Nếu là địa chỉ đầu tiên hoặc dto.isDefault = true -> Đặt làm mặc định
    const shouldBeDefault = existingCount === 0 || dto.isDefault === true;

    return this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const newAddress = await tx.address.create({
        data: {
          userId,
          recipientName: dto.recipientName.trim(),
          phone: dto.phone.trim(),
          provinceCode: dto.provinceCode,
          provinceName: dto.provinceName.trim(),
          districtCode: dto.districtCode,
          districtName: dto.districtName.trim(),
          wardCode: dto.wardCode,
          wardName: dto.wardName.trim(),
          detailAddress: dto.detailAddress.trim(),
          isDefault: shouldBeDefault,
        },
      });

      this.logger.log(`✅ Tạo thành công địa chỉ mới #${newAddress.id} cho User ID ${userId}`);
      return newAddress;
    });
  }

  /**
   * Cập nhật thông tin địa chỉ giao hàng
   */
  async updateAddress(userId: number, addressId: number, dto: UpdateAddressDto) {
    const existing = await this.getAddressById(userId, addressId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault === true && !existing.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const updated = await tx.address.update({
        where: { id: addressId },
        data: {
          recipientName: dto.recipientName ? dto.recipientName.trim() : undefined,
          phone: dto.phone ? dto.phone.trim() : undefined,
          provinceCode: dto.provinceCode ?? undefined,
          provinceName: dto.provinceName ? dto.provinceName.trim() : undefined,
          districtCode: dto.districtCode ?? undefined,
          districtName: dto.districtName ? dto.districtName.trim() : undefined,
          wardCode: dto.wardCode ?? undefined,
          wardName: dto.wardName ? dto.wardName.trim() : undefined,
          detailAddress: dto.detailAddress ? dto.detailAddress.trim() : undefined,
          isDefault: dto.isDefault ?? undefined,
        },
      });

      this.logger.log(`✏️ Cập nhật thành công địa chỉ #${addressId} cho User ID ${userId}`);
      return updated;
    });
  }

  /**
   * Đặt 1 địa chỉ làm mặc định
   */
  async setDefaultAddress(userId: number, addressId: number) {
    await this.getAddressById(userId, addressId);

    return this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      const updated = await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });

      this.logger.log(`⭐ Đã đặt địa chỉ #${addressId} làm mặc định cho User ID ${userId}`);
      return updated;
    });
  }

  /**
   * Xóa địa chỉ giao hàng
   */
  async deleteAddress(userId: number, addressId: number) {
    const existing = await this.getAddressById(userId, addressId);

    return this.prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id: addressId },
      });

      // Nếu địa chỉ vừa xóa là mặc định -> gán địa chỉ mới nhất còn lại làm mặc định
      if (existing.isDefault) {
        const latestAddress = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (latestAddress) {
          await tx.address.update({
            where: { id: latestAddress.id },
            data: { isDefault: true },
          });
        }
      }

      this.logger.log(`🗑️ Đã xóa địa chỉ #${addressId} của User ID ${userId}`);
      return { success: true, message: 'Đã xóa địa chỉ thành công' };
    });
  }
}
