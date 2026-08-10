import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  /**
   * GET /api/v1/addresses
   * Lấy danh sách toàn bộ địa chỉ giao hàng của người dùng đang đăng nhập
   */
  @Get()
  async getAddresses(@CurrentUser('sub') userId: number) {
    const data = await this.addressesService.getAddresses(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách địa chỉ thành công',
      data,
    };
  }

  /**
   * GET /api/v1/addresses/:id
   * Lấy chi tiết 1 địa chỉ theo ID
   */
  @Get(':id')
  async getAddressById(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.addressesService.getAddressById(userId, id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy chi tiết địa chỉ thành công',
      data,
    };
  }

  /**
   * POST /api/v1/addresses
   * Tạo địa chỉ giao hàng mới
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAddress(
    @CurrentUser('sub') userId: number,
    @Body() dto: CreateAddressDto,
  ) {
    const data = await this.addressesService.createAddress(userId, dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo địa chỉ giao hàng mới thành công',
      data,
    };
  }

  /**
   * PATCH /api/v1/addresses/:id
   * Cập nhật thông tin địa chỉ giao hàng
   */
  @Patch(':id')
  async updateAddress(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    const data = await this.addressesService.updateAddress(userId, id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật địa chỉ thành công',
      data,
    };
  }

  /**
   * PATCH /api/v1/addresses/:id/set-default
   * Đặt 1 địa chỉ làm mặc định
   */
  @Patch(':id/set-default')
  async setDefaultAddress(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.addressesService.setDefaultAddress(userId, id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Đã đặt địa chỉ làm mặc định',
      data,
    };
  }

  /**
   * DELETE /api/v1/addresses/:id
   * Xóa địa chỉ giao hàng
   */
  @Delete(':id')
  async deleteAddress(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.addressesService.deleteAddress(userId, id);
    return {
      statusCode: HttpStatus.OK,
      message: data.message,
      data,
    };
  }
}
