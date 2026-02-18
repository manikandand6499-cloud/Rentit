import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT || 5000);
  console.log("Server running on port", process.env.PORT || 5000);
}

bootstrap();
