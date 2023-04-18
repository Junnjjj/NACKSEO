import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpApiExceptionFilter } from './common/exceptions/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const prefix = '/api';
  // app.setGlobalPrefix(prefix);
  app.useGlobalFilters(new HttpApiExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const PORT = process.env.PORT;
  await app.listen(PORT);
}
bootstrap();
