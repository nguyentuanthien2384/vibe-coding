import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PreviewPointsCheckoutDto } from './dto/preview-points-checkout.dto';
import { PointsHistoryQueryDto } from './dto/points-history-query.dto';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  /**
   * 1. GET /api/v1/points/summary
   * Lấy tổng quan điểm và tiến trình thăng hạng của user
   */
  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getSummary(@CurrentUser('sub') userId: number) {
    const summary = await this.pointsService.getUserPointsSummary(userId);
    return {
      statusCode: 200,
      message: 'Lấy thông tin điểm tích lũy thành công',
      data: summary,
    };
  }

  /**
   * 2. GET /api/v1/points/history
   * Lấy lịch sử biến động điểm phân trang & lọc
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @CurrentUser('sub') userId: number,
    @Query() query: PointsHistoryQueryDto,
  ) {
    const history = await this.pointsService.getUserPointsHistory(userId, query);
    return {
      statusCode: 200,
      message: 'Lấy lịch sử điểm thành công',
      data: history,
    };
  }

  /**
   * 3. GET /api/v1/points/config
   * Lấy cấu hình hệ thống điểm (Public)
   */
  @Get('config')
  async getConfig() {
    const config = await this.pointsService.getPointsConfig();
    return {
      statusCode: 200,
      message: 'Lấy cấu hình điểm thành công',
      data: config,
    };
  }

  /**
   * 4. POST /api/v1/points/preview-checkout
   * Tính toán xem trước khấu trừ điểm khi thanh toán
   */
  @Post('preview-checkout')
  @UseGuards(JwtAuthGuard)
  async previewCheckout(
    @CurrentUser('sub') userId: number,
    @Body() dto: PreviewPointsCheckoutDto,
  ) {
    const calculation = await this.pointsService.previewCheckoutPoints(userId, dto);
    return {
      statusCode: 200,
      message: 'Tính toán điểm hợp lệ',
      data: calculation,
    };
  }
}
