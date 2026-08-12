import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { existsSync, promises as fs } from 'fs';
import { basename, join } from 'path';

export interface DeleteImageOptions {
  excludeCategoryId?: number;
  excludeProductId?: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads', 'images');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Trích xuất tên file từ URL tương đối hoặc tuyệt đối.
   * Ví dụ:
   *  - '/uploads/images/category-icon-1234.png' => 'category-icon-1234.png'
   *  - 'http://localhost:3001/uploads/images/product-5678.jpg' => 'product-5678.jpg'
   *  - 'https://images.unsplash.com/photo-123' => null (ảnh remote ngoài hệ thống)
   */
  extractFilename(url: string | null | undefined): string | null {
    if (!url || typeof url !== 'string') return null;

    const trimmed = url.trim();

    // Bỏ qua nếu là URL remote ngoài hệ thống (Unsplash, Cloudinary external, v.v.)
    if (
      (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
      !trimmed.includes('/uploads/images/')
    ) {
      return null;
    }

    if (!trimmed.includes('/uploads/images/') && !trimmed.startsWith('category-icon-') && !trimmed.startsWith('product-')) {
      return null;
    }

    try {
      // Loại bỏ query params nếu có
      const cleanUrl = trimmed.split('?')[0];
      const filename = basename(cleanUrl);

      // Chống Path Traversal (chỉ cho phép tên file hợp lệ)
      if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return null;
      }

      return filename;
    } catch {
      return null;
    }
  }

  /**
   * Kiểm tra xem tên file ảnh có đang được tham chiếu ở bảng/entity khác hay không.
   */
  async isImageReferencedElsewhere(
    filename: string,
    options: DeleteImageOptions = {},
  ): Promise<boolean> {
    try {
      // 1. Kiểm tra bảng Category
      const categoryCount = await this.prisma.category.count({
        where: {
          iconUrl: { contains: filename },
          ...(options.excludeCategoryId ? { id: { not: options.excludeCategoryId } } : {}),
        },
      });
      if (categoryCount > 0) return true;

      // 2. Kiểm tra bảng Product (imageUrl chính)
      const productMainCount = await this.prisma.product.count({
        where: {
          imageUrl: { contains: filename },
          ...(options.excludeProductId ? { id: { not: options.excludeProductId } } : {}),
        },
      });
      if (productMainCount > 0) return true;

      // 3. Kiểm tra bảng Product (gallery images JSON)
      const productGallery = await this.prisma.product.findMany({
        where: {
          images: { not: Prisma.JsonNull },
          ...(options.excludeProductId ? { id: { not: options.excludeProductId } } : {}),
        },
        select: { id: true, images: true },
      });

      for (const p of productGallery) {
        if (p.images && JSON.stringify(p.images).includes(filename)) {
          return true;
        }
      }

      // 4. Kiểm tra bảng Banner
      const bannerCount = await this.prisma.banner.count({
        where: {
          imageUrl: { contains: filename },
        },
      });
      if (bannerCount > 0) return true;

      return false;
    } catch (error) {
      this.logger.error(`Error checking image reference for ${filename}`, error);
      // Nếu có lỗi truy vấn DB, an toàn là không xóa
      return true;
    }
  }

  /**
   * Xóa 1 file ảnh vật lý trên ổ đĩa nếu là file nội bộ và không còn tham chiếu nào khác.
   */
  async deleteImageFile(
    url: string | null | undefined,
    options: DeleteImageOptions = {},
  ): Promise<boolean> {
    const filename = this.extractFilename(url);
    if (!filename) {
      return false;
    }

    const isReferenced = await this.isImageReferencedElsewhere(filename, options);
    if (isReferenced) {
      this.logger.log(
        `ℹ️ Bỏ qua xóa file '${filename}' vì vẫn đang được tham chiếu ở bảng dữ liệu khác.`,
      );
      return false;
    }

    const filePath = join(this.uploadDir, filename);

    if (!existsSync(filePath)) {
      this.logger.warn(`⚠️ File không tồn tại trên ổ đĩa: ${filePath}`);
      return false;
    }

    try {
      await fs.unlink(filePath);
      this.logger.log(`🗑️ Đã xóa file ảnh vật lý trên ổ đĩa: ${filename}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Không thể xóa file vật lý: ${filePath}`, error);
      return false;
    }
  }

  /**
   * Xóa danh sách file ảnh vật lý trên ổ đĩa.
   */
  async deleteImageFiles(
    urls: (string | null | undefined)[],
    options: DeleteImageOptions = {},
  ): Promise<number> {
    const validUrls = Array.from(new Set(urls.filter((u): u is string => Boolean(u))));
    let deletedCount = 0;

    for (const url of validUrls) {
      const deleted = await this.deleteImageFile(url, options);
      if (deleted) deletedCount++;
    }

    return deletedCount;
  }
}
