import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { VouchersService } from './vouchers.service';
import { ApplyVoucherDto } from './dto/apply-voucher.dto';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  /**
   * POST /api/v1/vouchers/apply
   * Kiểm tra & áp dụng mã giảm giá cho đơn hàng
   */
  @Post('apply')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async applyVoucher(@Body() dto: ApplyVoucherDto) {
    const data = await this.vouchersService.applyVoucher(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Áp dụng mã giảm giá thành công',
      data,
    };
  }
}
