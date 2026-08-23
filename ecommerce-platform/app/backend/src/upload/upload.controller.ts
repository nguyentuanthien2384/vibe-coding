import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  Param,
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
import { UploadService, MediaListResult } from './upload.service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'images');

// Đảm bảo thư mục tồn tại
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Controller('admin/upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * GET /api/v1/admin/upload/media
   * Lấy danh sách media đã upload với tìm kiếm, phân trang và trạng thái tham chiếu.
   * Quyền: ADMIN, STAFF
   */
  @Get('media')
  @Roles(Role.ADMIN, Role.STAFF)
  async getMediaList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ): Promise<{
    statusCode: number;
    message: string;
    data: MediaListResult['data'];
    pagination: MediaListResult['pagination'];
  }> {
    const result = await this.uploadService.getMediaList({ page, limit, search });
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách media thành công',
      data: result.data,
      pagination: result.pagination,
    };
  }

  /**
   * DELETE /api/v1/admin/upload/media/:filename
   * Xóa một file media theo tên file.
   * Quyền: ADMIN, STAFF
   */
  @Delete('media/:filename')
  @Roles(Role.ADMIN, Role.STAFF)
  async deleteMedia(
    @Param('filename') filename: string,
    @Query('force') force?: string,
  ): Promise<{ statusCode: number; message: string; data: { filename: string } }> {
    const result = await this.uploadService.deleteMediaFileByName(filename, force === 'true');
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: { filename: result.filename },
    };
  }

  /**
   * PATCH /api/v1/admin/upload/media/:filename
   * Đổi tên / sửa file media.
   * Quyền: ADMIN, STAFF
   */
  @Patch('media/:filename')
  @Roles(Role.ADMIN, Role.STAFF)
  async renameMedia(
    @Param('filename') filename: string,
    @Body('newFilename') newFilename: string,
  ): Promise<{ statusCode: number; message: string; data: { filename: string; url: string } }> {
    if (!newFilename || typeof newFilename !== 'string') {
      throw new BadRequestException('Tên file mới không hợp lệ.');
    }
    const result = await this.uploadService.renameMediaFile(filename, newFilename);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: { filename: result.filename, url: result.url },
    };
  }

  /**
   * POST /api/v1/admin/upload/image
   * Upload một file ảnh (JPEG, PNG, WebP, SVG, GIF). Trả về URL tương đối.
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
          cb(null, `media-${unique}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Định dạng file không hỗ trợ. Chỉ chấp nhận JPEG, PNG, WebP, SVG, GIF.',
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
