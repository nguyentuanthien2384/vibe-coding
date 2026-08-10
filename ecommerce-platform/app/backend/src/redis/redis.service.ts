import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private isConnected = false;
  private inMemoryFallback = new Map<string, { value: string; expiresAt?: number }>();

  onModuleInit() {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = Number(process.env.REDIS_PORT) || 6379;

    this.client = new Redis({
      host,
      port,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.warn('⚠️ Không thể kết nối Redis Server, chuyển sang In-Memory Fallback mode.');
          return null; // Stop retrying
        }
        return 1000;
      },
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('✅ Đã kết nối thành công với Redis Server.');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.warn(`⚠️ Redis Connection Error: ${err.message}. Sử dụng In-Memory Fallback.`);
    });

    // Fire & forget connect attempt
    this.client.connect().catch(() => {
      this.isConnected = false;
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
  }

  /**
   * Lưu key vào Redis với TTL (seconds)
   */
  async setEx(key: string, seconds: number, value: string): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.setex(key, seconds, value);
        return;
      } catch (error) {
        this.logger.error(`Redis setEx failed for key ${key}: ${error.message}`);
      }
    }
    // Fallback In-Memory
    const expiresAt = Date.now() + seconds * 1000;
    this.inMemoryFallback.set(key, { value, expiresAt });
  }

  /**
   * Lấy giá trị key từ Redis
   */
  async get(key: string): Promise<string | null> {
    if (this.isConnected) {
      try {
        return await this.client.get(key);
      } catch (error) {
        this.logger.error(`Redis get failed for key ${key}: ${error.message}`);
      }
    }
    // Fallback In-Memory
    const cached = this.inMemoryFallback.get(key);
    if (!cached) return null;
    if (cached.expiresAt && Date.now() > cached.expiresAt) {
      this.inMemoryFallback.delete(key);
      return null;
    }
    return cached.value;
  }

  /**
   * Xóa key khỏi Redis
   */
  async del(key: string): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.del(key);
        return;
      } catch (error) {
        this.logger.error(`Redis del failed for key ${key}: ${error.message}`);
      }
    }
    this.inMemoryFallback.delete(key);
  }

  /**
   * Xóa tất cả các key khớp với pattern (Ví dụ: 'auth:refresh:1:*')
   */
  async delByPattern(pattern: string): Promise<void> {
    if (this.isConnected) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
        return;
      } catch (error) {
        this.logger.error(`Redis delByPattern failed for pattern ${pattern}: ${error.message}`);
      }
    }
    // Fallback In-Memory
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.inMemoryFallback.keys()) {
      if (regexPattern.test(key)) {
        this.inMemoryFallback.delete(key);
      }
    }
  }
}

