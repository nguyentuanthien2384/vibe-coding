import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

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

      // Tự động kiểm tra bảng, nếu chưa có bảng thì tự động push schema và seed
      try {
        await this.category.count();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("doesn't exist") || msg.includes('does not exist')) {
          this.logger.warn('⚠️ Cơ sở dữ liệu chưa có bảng. Đang tự động tạo bảng và nạp dữ liệu...');
          this.runBootstrap();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`❌ Failed to connect to database: ${msg}. Please check DATABASE_URL.`);
    }
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
      this.logger.log('🌱 Đang nạp dữ liệu mẫu (db:seed)...');
      execSync('npm run db:seed', { stdio: 'inherit', env });
      this.logger.log('👑 Đang tạo tài khoản admin (db:create-admin)...');
      execSync('npm run db:create-admin', { stdio: 'inherit', env });
      this.logger.log('🎉 Khởi tạo cơ sở dữ liệu hoàn tất thành công!');
    } catch (bootstrapErr: unknown) {
      const msg = bootstrapErr instanceof Error ? bootstrapErr.message : String(bootstrapErr);
      this.logger.error(`❌ Khởi tạo cơ sở dữ liệu thất bại: ${msg}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('🔌 Database disconnected');
  }
}

