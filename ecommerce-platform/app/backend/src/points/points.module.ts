import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { AdminPointsController } from './admin-points.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, RedisModule, NotificationsModule],
  controllers: [PointsController, AdminPointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
