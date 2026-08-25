import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
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
  sse(@CurrentUser('sub') userId: number): Observable<{ data: any }> {
    return this.notificationsService.getSseStream(userId);
  }

  /**
   * GET /api/v1/notifications
   * Lấy danh sách thông báo In-App cá nhân có phân trang & số dư chưa đọc
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  getUserNotifications(
    @CurrentUser('sub') userId: number,
    @Query() queryDto: NotificationQueryDto,
  ) {
    return this.notificationsService.getUserNotifications(userId, queryDto);
  }

  /**
   * PATCH /api/v1/notifications/read-all
   * Đánh dấu tất cả thông báo là đã đọc
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@CurrentUser('sub') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   * Đánh dấu một thông báo là đã đọc
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }
}
