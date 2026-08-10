import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

function buildAdapter(): PrismaMariaDb {
  const dbUrl = new URL(
    process.env.DATABASE_URL ?? 'mysql://root:123456@127.0.0.1:3306/ecommerce_db',
  );
  return new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '3306', 10),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
    allowPublicKeyRetrieval: true,
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

