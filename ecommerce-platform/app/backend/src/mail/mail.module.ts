import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController, UserMailController } from './mail.controller';
import { AuthEmailListener } from './listeners/auth-email.listener';
import { OrderEmailListener } from './listeners/order-email.listener';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserMailController, MailController],
  providers: [MailService, AuthEmailListener, OrderEmailListener],
  exports: [MailService],
})
export class MailModule {}
