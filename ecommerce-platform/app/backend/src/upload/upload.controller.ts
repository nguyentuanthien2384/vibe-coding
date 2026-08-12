import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'images');

// Đảm bảo thư mục tồn tại
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Controller('admin/upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  /**
   * POST /api/v1/admin/upload/image
   * Upload một file ảnh (JPEG, PNG, WebP, SVG). Trả về URL tuyệt đối.
   * Quyền: ADMIN, STAFF
   */
  @Post('image')
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `category-icon-${unique}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Định dạng file không hỗ trợ. Chỉ chấp nhận JPEG, PNG, WebP, SVG.',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): { statusCode: number; message: string; data: { url: string; filename: string } } {
    if (!file) {
      throw new BadRequestException('Không có file nào được tải lên');
    }

    const url = `/uploads/images/${file.filename}`;

    return {
      statusCode: 201,
      message: 'Upload ảnh thành công',
      data: { url, filename: file.filename },
    };
  }
}
