import { PostStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdatePostStatusDto {
  @IsEnum(PostStatus, { message: 'Trang thai bai viet khong hop le' })
  status: PostStatus;
}
