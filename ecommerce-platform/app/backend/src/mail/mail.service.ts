import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailLogQueryDto } from './dto/email-log-query.dto';
import { EmailType, EmailStatus } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import {
  renderRegisterWelcomeEmail,
  renderOrderConfirmationEmail,
  renderPasswordChangedEmail,
  renderSecurityAlertEmail,
} from './templates/email-templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly prisma: PrismaService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.MAIL_HOST || 'smtp.ethereal.email';
    const port = parseInt(process.env.MAIL_PORT || '587', 10);
    const user = process.env.MAIL_USER || '';
    const pass = process.env.MAIL_PASS || '';

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      // In development fallback to test json transport if credentials not set
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  /**
   * Tạo bản ghi EmailLog với trạng thái PENDING
   */
  async createLog(params: {
    userId?: number;
    recipient: string;
    subject: string;
    type: EmailType;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.emailLog.create({
      data: {
        userId: params.userId,
        recipient: params.recipient,
        subject: params.subject,
        type: params.type,
        status: EmailStatus.PENDING,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
      },
    });
  }

  /**
   * Xử lý thực thi gửi email thực tế và cập nhật log
   */
  async dispatchMail(logId: number, htmlContent: string) {
    const log = await this.prisma.emailLog.findUnique({ where: { id: logId } });
    if (!log) {
      this.logger.error(`Không tìm thấy EmailLog ID ${logId}`);
      return;
    }

    const fromAddress = process.env.MAIL_FROM || '"TechBite Platform" <noreply@techbite.vn>';

    try {
      await this.transporter.sendMail({
        from: fromAddress,
        to: log.recipient,
        subject: log.subject,
        html: htmlContent,
      });

      await this.prisma.emailLog.update({
        where: { id: logId },
        data: {
          status: EmailStatus.SENT,
          sentAt: new Date(),
        },
      });

      this.logger.log(`[Email Delivered] Sent ${log.type} to ${log.recipient} (Log ID: ${logId})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[Email Failed] ${log.type} to ${log.recipient} (Log ID: ${logId}): ${errorMessage}`);

      await this.prisma.emailLog.update({
        where: { id: logId },
        data: {
          status: EmailStatus.FAILED,
          failedReason: errorMessage,
          retryCount: { increment: 1 },
        },
      });
    }
  }

  /**
   * Xử lý gửi email Đăng ký thành công
   */
  async sendRegisterWelcome(userId: number, recipient: string, fullName: string) {
    const { subject, html } = renderRegisterWelcomeEmail(fullName);
    const log = await this.createLog({
      userId,
      recipient,
      subject,
      type: EmailType.REGISTER_WELCOME,
      metadata: { fullName },
    });
    setImmediate(() => this.dispatchMail(log.id, html));
  }

  /**
   * Xử lý gửi email Xác nhận đơn hàng
   */
  async sendOrderConfirmation(data: {
    userId?: number;
    email: string;
    customerName: string;
    orderCode: string;
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: string;
    items: Array<{ productName: string; quantity: number; price: number; itemTotal: number }>;
  }) {
    const { subject, html } = renderOrderConfirmationEmail(data);
    const log = await this.createLog({
      userId: data.userId,
      recipient: data.email,
      subject,
      type: EmailType.ORDER_CONFIRMATION,
      metadata: { orderCode: data.orderCode, totalAmount: data.totalAmount },
    });
    setImmediate(() => this.dispatchMail(log.id, html));
  }

  /**
   * Xử lý gửi email Đổi mật khẩu thành công
   */
  async sendPasswordChanged(userId: number, recipient: string, fullName: string, ipAddress?: string) {
    const { subject, html } = renderPasswordChangedEmail(fullName, ipAddress);
    const log = await this.createLog({
      userId,
      recipient,
      subject,
      type: EmailType.PASSWORD_CHANGED,
      metadata: { fullName, ipAddress },
    });
    setImmediate(() => this.dispatchMail(log.id, html));
  }

  /**
   * Xử lý gửi email Cảnh báo bảo mật
   */
  async sendSecurityAlert(userId: number, recipient: string, fullName: string, ipAddress?: string) {
    const { subject, html } = renderSecurityAlertEmail(fullName, ipAddress);
    const log = await this.createLog({
      userId,
      recipient,
      subject,
      type: EmailType.SECURITY_ALERT,
      metadata: { fullName, ipAddress },
    });
    setImmediate(() => this.dispatchMail(log.id, html));
  }

  /**
   * API Quản trị: Lấy danh sách nhật ký gửi Email (Phân trang & Lọc)
   */
  async getEmailLogs(queryDto: EmailLogQueryDto) {
    const page = Number(queryDto.page) || 1;
    const limit = Number(queryDto.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (queryDto.type) {
      where.type = queryDto.type;
    }

    if (queryDto.status) {
      where.status = queryDto.status;
    }

    if (queryDto.search) {
      where.OR = [
        { recipient: { contains: queryDto.search } },
        { subject: { contains: queryDto.search } },
      ];
    }

    const [items, totalItems] = await Promise.all([
      this.prisma.emailLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.emailLog.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  /**
   * Lấy danh sách thông báo Email của riêng User đang đăng nhập (Lọc chính xác theo userId hoặc recipient email)
   */
  async getMyNotifications(userId: number, recipientEmail: string, queryDto: EmailLogQueryDto) {
    const page = Number(queryDto.page) || 1;
    const limit = Number(queryDto.limit) || 10;
    const skip = (page - 1) * limit;

    const normalizedEmail = recipientEmail ? recipientEmail.trim().toLowerCase() : '';

    const userCondition: any[] = [{ userId }];
    if (normalizedEmail) {
      userCondition.push({ recipient: { equals: normalizedEmail } });
    }

    const where: any = {
      OR: userCondition,
    };

    if (queryDto.type) {
      where.type = queryDto.type;
    }

    if (queryDto.status) {
      where.status = queryDto.status;
    }

    if (queryDto.search) {
      where.AND = [
        {
          subject: { contains: queryDto.search.trim() },
        },
      ];
    }

    const [items, totalItems] = await Promise.all([
      this.prisma.emailLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.emailLog.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  /**
   * API Quản trị: Gửi lại email bị thất bại
   */
  async resendEmail(id: number) {
    const log = await this.prisma.emailLog.findUnique({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Không tìm thấy nhật ký Email ID ${id}`);
    }

    // Reset status to PENDING
    await this.prisma.emailLog.update({
      where: { id },
      data: {
        status: EmailStatus.PENDING,
        failedReason: null,
      },
    });

    let html = '';
    const metadata = (log.metadata as Record<string, any>) || {};

    switch (log.type) {
      case EmailType.REGISTER_WELCOME:
        html = renderRegisterWelcomeEmail(metadata.fullName || 'bạn').html;
        break;
      case EmailType.ORDER_CONFIRMATION:
        html = renderOrderConfirmationEmail({
          customerName: metadata.customerName || log.recipient,
          orderCode: metadata.orderCode || 'TB-000000',
          totalAmount: metadata.totalAmount || 0,
          paymentMethod: metadata.paymentMethod || 'QR_CODE',
          shippingAddress: metadata.shippingAddress || 'Địa chỉ giao hàng',
          items: metadata.items || [],
        }).html;
        break;
      case EmailType.PASSWORD_CHANGED:
        html = renderPasswordChangedEmail(metadata.fullName || 'bạn', metadata.ipAddress).html;
        break;
      case EmailType.SECURITY_ALERT:
        html = renderSecurityAlertEmail(metadata.fullName || 'bạn', metadata.ipAddress).html;
        break;
    }

    setImmediate(() => this.dispatchMail(log.id, html));

    return {
      message: `Đã kích hoạt lại tiến trình gửi email cho nhật ký #${id}`,
    };
  }
}
