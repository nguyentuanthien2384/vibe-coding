import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminCategoriesService } from './admin-categories.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, RedisModule, AuthModule, UploadModule],
  controllers: [CategoriesController, AdminCategoriesController],
  providers: [CategoriesService, AdminCategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
