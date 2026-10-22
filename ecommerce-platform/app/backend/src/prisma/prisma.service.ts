import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { seedDatabase, SeedResult } from './database-seeder';

function buildAdapter(): PrismaMariaDb {
  const rawUrl =
    process.env.DATABASE_URL ?? 'mysql://root:123456@127.0.0.1:3306/ecommerce_db';
  const dbUrl = new URL(rawUrl);
  const isSsl =
    dbUrl.searchParams.get('ssl-mode') ||
    dbUrl.searchParams.get('ssl') ||
    dbUrl.searchParams.get('sslaccept') ||
    dbUrl.hostname.includes('tidbcloud.com') ||
    process.env.DATABASE_SSL === 'true';

  return new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '3306', 10),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace('/', '').split('?')[0],
    allowPublicKeyRetrieval: true,
    ssl: isSsl ? { rejectUnauthorized: false } : undefined,
  });
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: buildAdapter(),
      log: [
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');

      // Tự động kiểm tra sản phẩm, nếu chưa có bảng thì push schema, nếu bảng rỗng thì seed
      try {
        const productCount = await this.product.count();
        if (productCount === 0) {
          this.logger.warn('⚠️ Cơ sở dữ liệu đang có 0 sản phẩm. Đang tự động nạp dữ liệu mẫu...');
          const seedRes = await seedDatabase(this, false);
          this.logger.log(`🎉 Tự động nạp dữ liệu thành công: ${seedRes.productsCount} sản phẩm, ${seedRes.categoriesCount} danh mục.`);
        } else {
          this.logger.log(`ℹ️ Cơ sở dữ liệu hiện có ${productCount} sản phẩm.`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("doesn't exist") || msg.includes('does not exist')) {
          this.logger.warn('⚠️ Cơ sở dữ liệu chưa có bảng. Đang đồng bộ bảng...');
          this.runBootstrap();
          try {
            await seedDatabase(this, true);
            this.logger.log('🎉 Tự động nạp dữ liệu sau khi đồng bộ bảng thành công!');
          } catch (seedErr: unknown) {
            this.logger.error('Lỗi khi nạp seed sau bootstrap:', seedErr);
          }
        } else {
          this.logger.error(`❌ Lỗi kiểm tra bảng: ${msg}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`❌ Failed to connect to database: ${msg}. Please check DATABASE_URL.`);
    }
  }

  async seedDirectly(force = false): Promise<SeedResult> {
    return seedDatabase(this, force);
  }

  runBootstrap(): void {
    try {
      const rawUrl = process.env.DATABASE_URL;
      let pushUrl = rawUrl;
      if (pushUrl && pushUrl.includes('tidbcloud.com') && !pushUrl.includes('sslaccept=strict')) {
        pushUrl = pushUrl.split('?')[0] + '?sslaccept=strict';
      }
      const env = { ...process.env, DATABASE_URL: pushUrl };
      this.logger.log('🚀 Đang đồng bộ cấu trúc bảng (prisma db push)...');
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env });
      this.logger.log('🎉 Đồng bộ cấu trúc bảng hoàn tất!');
    } catch (bootstrapErr: unknown) {
      const msg = bootstrapErr instanceof Error ? bootstrapErr.message : String(bootstrapErr);
      this.logger.error(`❌ Khởi tạo cấu trúc bảng thất bại: ${msg}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('🔌 Database disconnected');
  }
}

