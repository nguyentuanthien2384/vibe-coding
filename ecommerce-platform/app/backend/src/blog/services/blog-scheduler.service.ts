import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { PostStatus } from '@prisma/client';

@Injectable()
export class BlogSchedulerService {
  private readonly logger = new Logger(BlogSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * JOB 1: Sync view counters tu Redis ve MySQL moi 5 phut
   * Tranh row lock contention khi co nhieu luot xem dong thoi
   */
  @Cron('*/5 * * * *')
  async syncViewsFromRedis(): Promise<void> {
    this.logger.log('[BlogScheduler] Bat dau sync views Redis -> MySQL...');
    try {
      const keys = await this.redis.keys('blog:views:*');
      if (!keys || keys.length === 0) return;

      // Pipeline lay va xoa atomic de khong mat views giua cac lan chay
      const updates: Array<{ postId: number; delta: number }> = [];
      for (const key of keys) {
        const rawDelta = await this.redis.getdel(key);
        if (!rawDelta) continue;
        const delta = parseInt(rawDelta, 10);
        if (isNaN(delta) || delta <= 0) continue;

        const postIdStr = key.replace('blog:views:', '');
        const postId = parseInt(postIdStr, 10);
        if (!isNaN(postId)) updates.push({ postId, delta });
      }

      if (updates.length === 0) {
        this.logger.log('[BlogScheduler] Khong co views moi can sync.');
        return;
      }

      await this.prisma.$transaction(
        updates.map(({ postId, delta }) =>
          this.prisma.post.update({
            where: { id: postId },
            data: { views: { increment: delta } },
          }),
        ),
      );

      this.logger.log(
        `[BlogScheduler] Sync views thanh cong: ${updates.length} bai viet, tong ${updates.reduce((s, u) => s + u.delta, 0)} luot xem.`,
      );
    } catch (err) {
      this.logger.error('[BlogScheduler] Sync views that bai: ' + err);
    }
  }

  /**
   * JOB 2: Xuat ban bai viet da len lich moi 1 phut
   */
  @Cron('*/1 * * * *')
  async publishScheduledPosts(): Promise<void> {
    try {
      const now = new Date();
      const scheduledPosts = await this.prisma.post.findMany({
        where: {
          status: PostStatus.SCHEDULED,
          scheduledAt: { lte: now },
        },
        select: { id: true, slug: true },
      });

      if (scheduledPosts.length === 0) return;

      await this.prisma.post.updateMany({
        where: {
          id: { in: scheduledPosts.map((p) => p.id) },
        },
        data: {
          status: PostStatus.PUBLISHED,
          publishedAt: now,
        },
      });

      // Invalidate cache cho tung bai
      for (const post of scheduledPosts) {
        await this.redis.del(`cache:v1:blog:post:${post.slug}`);
      }
      const listKeys = await this.redis.keys('cache:v1:blog:posts:*');
      if (listKeys.length > 0) {
        await Promise.all(listKeys.map((k) => this.redis.del(k)));
      }

      this.logger.log(
        `[BlogScheduler] Da xuat ban ${scheduledPosts.length} bai viet theo lich: ${scheduledPosts.map((p) => p.slug).join(', ')}`,
      );
    } catch (err) {
      this.logger.error('[BlogScheduler] Publish scheduled posts that bai: ' + err);
    }
  }
}
