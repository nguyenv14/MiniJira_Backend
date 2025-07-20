import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, UnprocessableEntityException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // Cấu hình CORS
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = {};

        for (const error of errors) {
          if (error.constraints) {
            formattedErrors[error.property] = Object.values(error.constraints);
          }
        }

        return new UnprocessableEntityException({
          statusCode: 422,
          error: 'Unprocessable Entity Request',
          message: formattedErrors,
        });
      },
    }),
  );
  app.enableCors({
    origin: 'http://localhost:3000', // Cho phép domain frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  await app.listen(8000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
