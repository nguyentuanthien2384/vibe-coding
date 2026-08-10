import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyVoucherDto } from './dto/apply-voucher.dto';

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Kiểm tra & tính toán giá trị giảm giá của Voucher
   */
  async applyVoucher(dto: ApplyVoucherDto) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: dto.code },
    });

    if (!voucher || !voucher.isActive) {
      throw new NotFoundException('Mã giảm giá không tồn tại hoặc đã hết hạn');
    }

    const now = new Date();
    if (voucher.startDate && voucher.startDate > now) {
      throw new BadRequestException('Mã giảm giá chưa đến thời gian sử dụng');
    }
    if (voucher.endDate && voucher.endDate < now) {
      throw new BadRequestException('Mã giảm giá đã hết hạn sử dụng');
    }

    if (
      voucher.usageLimit !== null &&
      voucher.usedCount >= voucher.usageLimit
    ) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }

    const subtotal = dto.subtotal;
    if (
      voucher.minOrderAmount !== null &&
      subtotal < Number(voucher.minOrderAmount)
    ) {
      const minAmount = new Intl.NumberFormat('vi-VN').format(
        Number(voucher.minOrderAmount),
      );
      throw new BadRequestException(
        `Mã giảm giá chỉ áp dụng cho đơn hàng từ ${minAmount}đ`,
      );
    }

    let calculatedDiscount = 0;
    if (voucher.discountType === 'FIXED_AMOUNT') {
      calculatedDiscount = Number(voucher.discountValue);
    } else if (voucher.discountType === 'PERCENTAGE') {
      calculatedDiscount = (subtotal * Number(voucher.discountValue)) / 100;
      if (voucher.maxDiscountAmount !== null) {
        calculatedDiscount = Math.min(
          calculatedDiscount,
          Number(voucher.maxDiscountAmount),
        );
      }
    }

    // Giảm tối đa không vượt quá subtotal
    calculatedDiscount = Math.min(calculatedDiscount, subtotal);

    return {
      voucherCode: voucher.code,
      title: voucher.title,
      discountType: voucher.discountType,
      discountValue: Number(voucher.discountValue),
      calculatedDiscount,
      message: `Áp dụng thành công mã ${voucher.code}`,
    };
  }
}
