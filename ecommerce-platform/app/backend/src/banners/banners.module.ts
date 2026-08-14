import { Module } from '@nestjs/common';
import { BannersController } from './banners.controller';
import { AdminBannersController } from './admin-banners.controller';
import { BannersService } from './banners.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [BannersController, AdminBannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
