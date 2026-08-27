import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BannersModule } from './banners/banners.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { RedisModule } from './redis/redis.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';

import { NotificationsModule } from './notifications/notifications.module';
import { CustomersModule } from './customers/customers.module';
import { SettingsModule } from './settings/settings.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { StaffsModule } from './staffs/staffs.module';
import { PointsModule } from './points/points.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot(),
    PrismaModule,
    RedisModule,
    BannersModule,
    CategoriesModule,
    ProductsModule,
    AuthModule,
    CartModule,
    VouchersModule,
    OrdersModule,
    AddressesModule,
    MailModule,
    UploadModule,
    NotificationsModule,
    CustomersModule,
    SettingsModule,
    DashboardModule,
    StaffsModule,
    PointsModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

