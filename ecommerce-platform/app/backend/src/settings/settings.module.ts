import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { AdminSettingsController } from './admin-settings.controller';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [SettingsController, AdminSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
