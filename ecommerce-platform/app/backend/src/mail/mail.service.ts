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
  renderOrderStatusUpdatedByAdminEmail,
  renderPaymentConfirmedByAdminEmail,
} from './templates/email-templates';

interface DynamicEmailConfig {
  mailDriver?: string;
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: string;
  smtpUser: string;
  smtpPassword?: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  adminAlertEmail?: string;
  enableOrderAlertAdmin?: boolean;
  enableWelcomeMail?: boolean;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private cachedTransporter: nodemailer.Transporter | null = null;
  private lastConfigHash: string = '';
  private cachedFromAddress: string = '';
  private cachedReplyTo: string = '';
  private cachedConfig: DynamicEmailConfig | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy cấu hình SMTP động từ DB (hoặc fallback .env) và khởi tạo / tái sử dụng Transporter
   */
  private async getTransporterInfo(): Promise<{
    transporter: nodemailer.Transporter;
    fromAddress: string;
    replyToAddress?: string;
    config: DynamicEmailConfig | null;
  }> {
    try {
      // 1. Đọc cấu hình từ system_settings
      const settingRecord = await this.prisma.systemSetting.findUnique({
        where: { key: 'email' },
      });

      let config: DynamicEmailConfig | null = null;
      if (settingRecord && settingRecord.value) {
        config = settingRecord.value as unknown as DynamicEmailConfig;
      }

      // 2. Tính toán hash cấu hình để phát hiện thay đổi
      const currentHash = config
        ? `${config.smtpHost}:${config.smtpPort}:${config.smtpEncryption}:${config.smtpUser}:${config.smtpPassword || ''}:${config.fromEmail}:${config.fromName}`
        : 'fallback-env';

      // 3. Nếu cấu hình không đổi và đã có cachedTransporter, tái sử dụng
      if (this.cachedTransporter && this.lastConfigHash === currentHash) {
        return {
          transporter: this.cachedTransporter,
          fromAddress: this.cachedFromAddress,
          replyToAddress: this.cachedReplyTo || undefined,
          config: this.cachedConfig,
        };
      }

      // 4. Khởi tạo Transporter mới
      let transporter: nodemailer.Transporter;
      let fromAddress: string;
      let replyToAddress: string = '';

      if (
        config &&
        config.smtpHost &&
        config.smtpUser &&
        config.smtpPassword &&
        config.smtpPassword.trim() !== ''
      ) {
        transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort || 587,
          secure: config.smtpEncryption === 'ssl' || config.smtpPort === 465,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPassword,
          },
          ...(config.smtpEncryption === 'tls' ? { requireTLS: true } : {}),
          connectionTimeout: 10000,
          greetingTimeout: 5000,
        });

        fromAddress = `"${config.fromName || 'TechBite Platform'}" <${config.fromEmail || config.smtpUser}>`;
        replyToAddress = config.replyToEmail || config.fromEmail || '';
      } else {
        // Fallback về biến môi trường .env hoặc jsonTransport mô phỏng nếu chưa cấu hình mật khẩu SMTP
        const host = process.env.MAIL_HOST || 'smtp.ethereal.email';
        const port = parseInt(process.env.MAIL_PORT || '587', 10);
        const user = process.env.MAIL_USER || '';
        const pass = process.env.MAIL_PASS || '';

        if (user && pass && pass.trim() !== '') {
          transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
          });
        } else {
          transporter = nodemailer.createTransport({
            jsonTransport: true,
          });
        }

        fromAddress = config?.fromEmail
          ? `"${config.fromName || 'TechBite Platform'}" <${config.fromEmail}>`
          : (process.env.MAIL_FROM || '"TechBite Platform" <noreply@techbite.vn>');
        replyToAddress = config?.replyToEmail || config?.fromEmail || '';
      }

      // Lưu cache
      this.cachedTransporter = transporter;
      this.lastConfigHash = currentHash;
      this.cachedFromAddress = fromAddress;
      this.cachedReplyTo = replyToAddress;
      this.cachedConfig = config;

      this.logger.log(`[MailService] Initialized SMTP Transporter (${fromAddress})`);

      return {
        transporter,
        fromAddress,
        replyToAddress: replyToAddress || undefined,
        config,
      };
    } catch (error) {
      this.logger.error('[MailService] Lỗi khởi tạo Transporter:', error);
      // Fallback an toàn
      const fallbackTransporter = nodemailer.createTransport({ jsonTransport: true });
      return {
        transporter: fallbackTransporter,
        fromAddress: '"TechBite Platform" <noreply@techbite.vn>',
        config: null,
      };
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

    try {
      const { transporter, fromAddress, replyToAddress } = await this.getTransporterInfo();

      await transporter.sendMail({
        from: fromAddress,
        to: log.recipient,
        replyTo: replyToAddress,
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
    const { config } = await this.getTransporterInfo();
    if (config && config.enableWelcomeMail === false) {
      this.logger.log(`[Email Skipped] Welcome email disabled in settings for ${recipient}`);
      return;
    }

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

    // Gửi cảnh báo đơn hàng mới cho Admin nếu được bật
    const { config } = await this.getTransporterInfo();
    if (config?.enableOrderAlertAdmin && config.adminAlertEmail && config.adminAlertEmail !== data.email) {
      const adminLog = await this.createLog({
        recipient: config.adminAlertEmail,
        subject: `[TechBite Admin] Có đơn hàng mới #${data.orderCode} - ${new Intl.NumberFormat('vi-VN').format(data.totalAmount)}đ`,
        type: EmailType.ORDER_CONFIRMATION,
        metadata: { orderCode: data.orderCode, isAdminAlert: true, totalAmount: data.totalAmount },
      });
      setImmediate(() => this.dispatchMail(adminLog.id, html));
    }
  }

  /**
   * Xử lý gửi email Thông báo khi Admin Cập nhật trạng thái đơn hàng (CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, REFUNDED...)
   */
  async sendOrderStatusUpdatedNotification(data: {
    userId?: number;
    email: string;
    customerName: string;
    orderCode: string;
    orderStatus: string;
    totalAmount: number;
    cancelReason?: string;
  }) {
    const { subject, html } = renderOrderStatusUpdatedByAdminEmail(data);
    const log = await this.createLog({
      userId: data.userId,
      recipient: data.email,
      subject,
      type: EmailType.ORDER_STATUS_CHANGED,
      metadata: {
        orderCode: data.orderCode,
        status: data.orderStatus,
        totalAmount: data.totalAmount,
        cancelReason: data.cancelReason,
      },
    });
    setImmediate(() => this.dispatchMail(log.id, html));
  }

  /**
   * Xử lý gửi email Thông báo khi Admin Xác nhận thanh toán (PAID)
   */
  async sendPaymentConfirmedNotification(data: {
    userId?: number;
    email: string;
    customerName: string;
    orderCode: string;
    totalAmount: number;
    paymentMethod: string;
  }) {
    const { subject, html } = renderPaymentConfirmedByAdminEmail(data);
    const log = await this.createLog({
      userId: data.userId,
      recipient: data.email,
      subject,
      type: EmailType.PAYMENT_CONFIRMED,
      metadata: { orderCode: data.orderCode, paymentStatus: 'PAID', totalAmount: data.totalAmount },
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
      case EmailType.ORDER_STATUS_CHANGED:
        html = renderOrderStatusUpdatedByAdminEmail({
          customerName: metadata.customerName || log.recipient,
          orderCode: metadata.orderCode || 'TB-000000',
          orderStatus: metadata.status || 'CONFIRMED',
          totalAmount: metadata.totalAmount || 0,
          cancelReason: metadata.cancelReason,
        }).html;
        break;
      case EmailType.PAYMENT_CONFIRMED:
        html = renderPaymentConfirmedByAdminEmail({
          customerName: metadata.customerName || log.recipient,
          orderCode: metadata.orderCode || 'TB-000000',
          totalAmount: metadata.totalAmount || 0,
          paymentMethod: metadata.paymentMethod || 'QR_CODE',
        }).html;
        break;
    }

    setImmediate(() => this.dispatchMail(log.id, html));

    return {
      message: `Đã kích hoạt lại tiến trình gửi email cho nhật ký #${id}`,
    };
  }
}
