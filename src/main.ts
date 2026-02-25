import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

console.log("DATABASE_URL:", process.env.DATABASE_URL);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  });

  // Enable Global Validation Pipe,,,
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Removes properties not in DTO
      forbidNonWhitelisted: true,   // Throws error if extra properties sent
      transform: true,              // Automatically transforms payloads to DTO instances
    }),
  );

  const PORT = process.env.PORT || 5000;

  await app.listen(PORT);
  console.log(`Server running on port is ${PORT}`);
}

bootstrap();