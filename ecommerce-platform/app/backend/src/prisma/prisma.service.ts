import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

function buildAdapter(): PrismaMariaDb {
  const rawUrl =
    process.env.DATABASE_URL ?? 'mysql://root:123456@127.0.0.1:3306/ecommerce_db';
  const dbUrl = new URL(rawUrl);
  const isSsl =
    dbUrl.searchParams.get('ssl-mode') ||
    dbUrl.searchParams.get('ssl') ||
    process.env.DATABASE_SSL === 'true';

  return new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '3306', 10),
    user: dbUrl.username,
    password: dbUrl.password,
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
    await this.$connect();
    this.logger.log('✅ Database connected successfully');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('🔌 Database disconnected');
  }
}

