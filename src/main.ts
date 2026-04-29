import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /// ✅ CORS (better config)
  app.enableCors({
    origin: true, // 🔥 allow all dynamically
    credentials: true,
  });

  /// ✅ VALIDATION (important)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // removes unwanted fields
      transform: true,        // auto type convert (string → number)
      forbidNonWhitelisted: true, // 🔥 security
    }),
  );

  /// ✅ STATIC FILES
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();