import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { AdminRoleGroupsController } from './admin-role-groups.controller';
import { AdminRoleGroupsService } from './admin-role-groups.service';
import { AdminStaffsController } from './admin-staffs.controller';
import { AdminStaffsService } from './admin-staffs.service';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [AdminRoleGroupsController, AdminStaffsController],
  providers: [AdminRoleGroupsService, AdminStaffsService],
  exports: [AdminRoleGroupsService, AdminStaffsService],
})
export class StaffsModule {}
