import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { BlogPublicController } from './controllers/blog-public.controller';
import { BlogAdminController } from './controllers/blog-admin.controller';
import { BlogPublicService } from './services/blog-public.service';
import { BlogAdminService } from './services/blog-admin.service';
import { BlogSchedulerService } from './services/blog-scheduler.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    PrismaModule,
    RedisModule,
  ],
  controllers: [BlogPublicController, BlogAdminController],
  providers: [BlogPublicService, BlogAdminService, BlogSchedulerService],
  exports: [BlogPublicService, BlogAdminService],
})
export class BlogModule {}
