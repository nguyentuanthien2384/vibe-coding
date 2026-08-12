import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { CORS_WHITELIST } from './config/cors.constants';

async function bootstrap() {
  // Đảm bảo thư mục uploads/images tồn tại khi khởi động server
  const uploadsDir = join(process.cwd(), 'uploads');
  const imagesDir = join(uploadsDir, 'images');
  if (!existsSync(imagesDir)) {
    mkdirSync(imagesDir, { recursive: true });
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Phục vụ static files từ thư mục /uploads
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads',
  });

  // Loại trừ route /uploads khỏi global prefix /api/v1
  app.setGlobalPrefix('api/v1', {
    exclude: ['uploads/(.*)'],
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (mobile apps, curl, Postman)
      if (!origin || CORS_WHITELIST.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin "${origin}" không được phép`), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-session-id', 'X-Session-ID'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
