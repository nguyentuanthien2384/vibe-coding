import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { existsSync, promises as fs } from 'fs';
import { basename, join, extname } from 'path';

export interface DeleteImageOptions {
  excludeCategoryId?: number;
  excludeProductId?: number;
}

export interface MediaFileItem {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  mimeType: string;
  isReferenced: boolean;
}

export interface MediaListResult {
  data: MediaFileItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads', 'images');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách toàn bộ các file media đã upload với phân trang, tìm kiếm và kiểm tra tham chiếu.
   */
  async getMediaList(query: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<MediaListResult> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const search = query.search ? query.search.trim().toLowerCase() : '';

    if (!existsSync(this.uploadDir)) {
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    try {
      const allFiles = await fs.readdir(this.uploadDir);
      
      // Lọc các file hình ảnh hợp lệ
      const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];
      const mediaFiles = allFiles.filter((file) => {
        const ext = extname(file).toLowerCase();
        return validExtensions.includes(ext);
      });

      // Đọc thông tin file chi tiết
      const fileStatsPromises = mediaFiles.map(async (filename) => {
        try {
          const filePath = join(this.uploadDir, filename);
          const stat = await fs.stat(filePath);
          const ext = extname(filename).toLowerCase();

          let mimeType = 'image/jpeg';
          if (ext === '.png') mimeType = 'image/png';
          else if (ext === '.webp') mimeType = 'image/webp';
          else if (ext === '.svg') mimeType = 'image/svg+xml';
          else if (ext === '.gif') mimeType = 'image/gif';

          return {
            filename,
            url: `/uploads/images/${filename}`,
            size: stat.size,
            createdAt: (stat.birthtime || stat.mtime).toISOString(),
            updatedAt: stat.mtime.toISOString(),
            mimeType,
            mtimeMs: stat.mtimeMs,
          };
        } catch {
          return null;
        }
      });

      const resolvedStats = (await Promise.all(fileStatsPromises)).filter(
        (item): item is NonNullable<typeof item> => item !== null,
      );

      // Tìm kiếm theo tên file nếu có
      let filtered = resolvedStats;
      if (search) {
        filtered = filtered.filter((item) =>
          item.filename.toLowerCase().includes(search),
        );
      }

      // Sắp xếp file mới nhất lên đầu
      filtered.sort((a, b) => b.mtimeMs - a.mtimeMs);

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const offset = (page - 1) * limit;
      const paginatedItems = filtered.slice(offset, offset + limit);

      // Kiểm tra xem các file hiển thị có đang được tham chiếu trong DB hay không
      const itemsWithRef = await Promise.all(
        paginatedItems.map(async (item) => {
          const isReferenced = await this.isImageReferencedElsewhere(item.filename);
          return {
            filename: item.filename,
            url: item.url,
            size: item.size,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            mimeType: item.mimeType,
            isReferenced,
          };
        }),
      );

      return {
        data: itemsWithRef,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Lỗi khi đọc danh sách media:', error);
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }
  }

  /**
   * Xóa file ảnh trực tiếp theo tên file từ trang quản lý Media.
   */
  async deleteMediaFileByName(
    filename: string,
    force = false,
  ): Promise<{ message: string; filename: string }> {
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Tên file không hợp lệ');
    }

    const filePath = join(this.uploadDir, filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException(`Không tìm thấy file '${filename}' trên hệ thống`);
    }

    if (!force) {
      const isReferenced = await this.isImageReferencedElsewhere(filename);
      if (isReferenced) {
        throw new BadRequestException(
          `Không thể xóa file '${filename}' vì đang được sử dụng làm ảnh sản phẩm, chuyên mục hoặc banner. Nếu vẫn muốn xóa, vui lòng chọn xóa bắt buộc.`,
        );
      }
    }

    try {
      await fs.unlink(filePath);
      this.logger.log(`🗑️ Đã xóa file media: ${filename}`);
      return {
        message: 'Xóa tập tin media thành công',
        filename,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xóa file media: ${filePath}`, error);
      throw new InternalServerErrorException('Không thể xóa tập tin media trên ổ đĩa');
    }
  }

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

    if (
      !trimmed.includes('/uploads/images/') &&
      !trimmed.startsWith('category-icon-') &&
      !trimmed.startsWith('product-') &&
      !trimmed.startsWith('media-')
    ) {
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

      // 5. Kiểm tra bảng Post (thumbnail)
      const postCount = await this.prisma.post.count({
        where: {
          thumbnail: { contains: filename },
        },
      });
      if (postCount > 0) return true;

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

  /**
   * Đổi tên file media an toàn và đồng bộ URL trong cơ sở dữ liệu nếu có.
   */
  async renameMediaFile(
    oldFilename: string,
    newFilenameRaw: string,
  ): Promise<{ filename: string; url: string; message: string }> {
    const ext = extname(oldFilename).toLowerCase();
    let safeName = newFilenameRaw.trim().replace(/[^a-zA-Z0-9_-]/g, '-');
    if (!safeName.endsWith(ext)) {
      safeName += ext;
    }

    const oldPath = join(this.uploadDir, oldFilename);
    const newPath = join(this.uploadDir, safeName);

    if (!existsSync(oldPath)) {
      throw new NotFoundException(`Tập tin '${oldFilename}' không tồn tại.`);
    }

    if (existsSync(newPath) && safeName !== oldFilename) {
      throw new BadRequestException(`Tập tin '${safeName}' đã tồn tại.`);
    }

    await fs.rename(oldPath, newPath);

    const oldUrl = `/uploads/images/${oldFilename}`;
    const newUrl = `/uploads/images/${safeName}`;

    // Cập nhật database nếu có tham chiếu
    try {
      await this.prisma.category.updateMany({
        where: { iconUrl: oldUrl },
        data: { iconUrl: newUrl },
      });
      await this.prisma.product.updateMany({
        where: { imageUrl: oldUrl },
        data: { imageUrl: newUrl },
      });
      await this.prisma.banner.updateMany({
        where: { imageUrl: oldUrl },
        data: { imageUrl: newUrl },
      });
    } catch (e) {
      this.logger.warn(`Could not update references for renamed file ${oldFilename}: ${e}`);
    }

    return {
      filename: safeName,
      url: newUrl,
      message: `Đổi tên file thành '${safeName}' thành công.`,
    };
  }
}
