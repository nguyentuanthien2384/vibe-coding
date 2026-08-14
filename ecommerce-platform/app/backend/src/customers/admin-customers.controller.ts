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
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminCustomersService } from './admin-customers.service';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerStatusDto } from './dto/update-customer-status.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerOrderQueryDto } from './dto/customer-order-query.dto';
import { AddCustomerAddressDto } from './dto/add-customer-address.dto';
import {
  CustomerDetailResponse,
  CustomerListResponse,
  CustomerMutateResponse,
  CustomerOrdersResponse,
} from './interfaces/customer.interface';

@Controller('admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCustomersController {
  constructor(private readonly adminCustomersService: AdminCustomersService) {}

  /**
   * GET /api/v1/admin/customers
   * Lấy danh sách khách hàng (Thành viên + Vãng lai) cho Admin Dashboard
   * Quyền: ADMIN, STAFF
   */
  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  findAll(@Query() dto: CustomerQueryDto): Promise<CustomerListResponse> {
    return this.adminCustomersService.findAll(dto);
  }

  /**
   * GET /api/v1/admin/customers/:id
   * Xem thông tin chi tiết khách hàng (Profile, chỉ số tài chính, danh sách địa chỉ)
   * Quyền: ADMIN, STAFF
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<CustomerDetailResponse> {
    return this.adminCustomersService.findOne(id);
  }

  /**
   * POST /api/v1/admin/customers
   * Tạo mới tài khoản khách hàng thủ công
   * Quyền: ADMIN, STAFF
   */
  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCustomerDto): Promise<CustomerMutateResponse> {
    return this.adminCustomersService.create(dto);
  }

  /**
   * PATCH /api/v1/admin/customers/:id/status
   * Cập nhật trạng thái tài khoản khách hàng (ACTIVE / BLOCKED / INACTIVE)
   * Quyền: ADMIN, STAFF
   */
  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerStatusDto,
  ): Promise<CustomerMutateResponse> {
    return this.adminCustomersService.updateStatus(id, dto);
  }

  /**
   * PATCH /api/v1/admin/customers/:id
   * Cập nhật thông tin cá nhân cơ bản của khách hàng
   * Quyền: ADMIN, STAFF
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<CustomerMutateResponse> {
    return this.adminCustomersService.update(id, dto);
  }

  /**
   * GET /api/v1/admin/customers/:id/orders
   * Lấy danh sách lịch sử đơn hàng của khách hàng có phân trang & tìm kiếm
   * Quyền: ADMIN, STAFF
   */
  @Get(':id/orders')
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  getCustomerOrders(
    @Param('id') id: string,
    @Query() dto: CustomerOrderQueryDto,
  ): Promise<CustomerOrdersResponse> {
    return this.adminCustomersService.getCustomerOrders(id, dto);
  }

  /**
   * POST /api/v1/admin/customers/:id/addresses
   * Thêm địa chỉ giao hàng mới cho khách hàng
   * Quyền: ADMIN, STAFF
   */
  @Post(':id/addresses')
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.CREATED)
  addAddress(
    @Param('id') id: string,
    @Body() dto: AddCustomerAddressDto,
  ): Promise<CustomerMutateResponse> {
    return this.adminCustomersService.addAddress(id, dto);
  }

  /**
   * PATCH /api/v1/admin/customers/:id/addresses/:addressId/default
   * Đặt địa chỉ mặc định cho khách hàng
   * Quyền: ADMIN, STAFF
   */
  @Patch(':id/addresses/:addressId/default')
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  setDefaultAddress(
    @Param('id') id: string,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<CustomerMutateResponse> {
    return this.adminCustomersService.setDefaultAddress(id, addressId);
  }

  /**
   * DELETE /api/v1/admin/customers/:id/addresses/:addressId
   * Xóa địa chỉ của khách hàng
   * Quyền: ADMIN, STAFF
   */
  @Delete(':id/addresses/:addressId')
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  deleteAddress(
    @Param('id') id: string,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<CustomerMutateResponse> {
    return this.adminCustomersService.deleteAddress(id, addressId);
  }
}
