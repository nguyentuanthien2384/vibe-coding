import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../mail.service';
import { OrderConfirmedEvent } from '../events/mail.events';

@Injectable()
export class OrderEmailListener {
  private readonly logger = new Logger(OrderEmailListener.name);

  constructor(private readonly mailService: MailService) {}

  @OnEvent('order.created', { async: true })
  async handleOrderCreatedEvent(event: OrderConfirmedEvent) {
    this.logger.log(`Received order.created event for order #${event.orderCode}`);
    await this.mailService.sendOrderConfirmation({
      userId: event.userId,
      email: event.email,
      customerName: event.customerName,
      orderCode: event.orderCode,
      totalAmount: event.totalAmount,
      paymentMethod: event.paymentMethod,
      shippingAddress: event.shippingAddress,
      items: event.items,
    });
  }

  @OnEvent('order.paid', { async: true })
  async handleOrderPaidEvent(event: OrderConfirmedEvent) {
    this.logger.log(`Received order.paid event for order #${event.orderCode}`);
    await this.mailService.sendOrderConfirmation({
      userId: event.userId,
      email: event.email,
      customerName: event.customerName,
      orderCode: event.orderCode,
      totalAmount: event.totalAmount,
      paymentMethod: event.paymentMethod,
      shippingAddress: event.shippingAddress,
      items: event.items,
    });
  }
}
