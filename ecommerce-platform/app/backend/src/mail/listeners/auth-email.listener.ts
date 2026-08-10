import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../mail.service';
import {
  UserRegisteredEvent,
  PasswordChangedEvent,
  TokenCompromisedEvent,
} from '../events/mail.events';

@Injectable()
export class AuthEmailListener {
  private readonly logger = new Logger(AuthEmailListener.name);

  constructor(private readonly mailService: MailService) {}

  @OnEvent('user.registered', { async: true })
  async handleUserRegisteredEvent(event: UserRegisteredEvent) {
    this.logger.log(`Received user.registered event for email ${event.email}`);
    await this.mailService.sendRegisterWelcome(event.userId, event.email, event.fullName);
  }

  @OnEvent('password.changed', { async: true })
  async handlePasswordChangedEvent(event: PasswordChangedEvent) {
    this.logger.log(`Received password.changed event for user ID ${event.userId}`);
    await this.mailService.sendPasswordChanged(
      event.userId,
      event.email,
      event.fullName,
      event.ipAddress,
    );
  }

  @OnEvent('security.token_compromised', { async: true })
  async handleTokenCompromisedEvent(event: TokenCompromisedEvent) {
    this.logger.log(`Received security.token_compromised event for user ID ${event.userId}`);
    await this.mailService.sendSecurityAlert(
      event.userId,
      event.email,
      event.fullName,
      event.ipAddress,
    );
  }
}
