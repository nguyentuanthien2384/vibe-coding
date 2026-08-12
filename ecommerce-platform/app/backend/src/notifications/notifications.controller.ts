import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { Observable } from 'rxjs';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /api/v1/notifications/sse
   * Luồng SSE (Server-Sent Events) nhận thông báo thời gian thực dành riêng cho User đăng nhập
   */
  @Sse('sse')
  sse(@Req() req: any): Observable<{ data: any }> {
    const userId = req.user.id || req.user.userId;
    return this.notificationsService.getSseStream(userId);
  }

  /**
   * GET /api/v1/notifications
   * Lấy danh sách thông báo In-App cá nhân có phân trang & số dư chưa đọc
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  getUserNotifications(@Req() req: any, @Query() queryDto: NotificationQueryDto) {
    const userId = req.user.id || req.user.userId;
    return this.notificationsService.getUserNotifications(userId, queryDto);
  }

  /**
   * PATCH /api/v1/notifications/read-all
   * Đánh dấu tất cả thông báo là đã đọc
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@Req() req: any) {
    const userId = req.user.id || req.user.userId;
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   * Đánh dấu một thông báo là đã đọc
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.id || req.user.userId;
    return this.notificationsService.markAsRead(id, userId);
  }
}
