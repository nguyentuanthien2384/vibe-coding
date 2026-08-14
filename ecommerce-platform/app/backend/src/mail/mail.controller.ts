import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { EmailLogQueryDto } from './dto/email-log-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/auth-response.interface';
import { Role } from '@prisma/client';

@Controller('mail')
@UseGuards(JwtAuthGuard)
export class UserMailController {
  constructor(private readonly mailService: MailService) {}

  @Get('my-notifications')
  async getMyNotifications(
    @CurrentUser() user: JwtPayload,
    @Query() queryDto: EmailLogQueryDto,
  ) {
    const result = await this.mailService.getMyNotifications(user.sub, user.email, queryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách thông báo email cá nhân thành công',
      data: result,
    };
  }
}

@Controller('admin/email-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get()
  async getEmailLogs(@Query() queryDto: EmailLogQueryDto) {
    const result = await this.mailService.getEmailLogs(queryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách nhật ký email thành công',
      data: result,
    };
  }

  @Post(':id/resend')
  @HttpCode(HttpStatus.OK)
  async resendEmail(@Param('id', ParseIntPipe) id: number) {
    const result = await this.mailService.resendEmail(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }
}
