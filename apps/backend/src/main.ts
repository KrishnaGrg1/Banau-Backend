import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://banau.netlify.app',
      'https://krishnabgurung.com.np',
      /^https:\/\/.*\.krishnabgurung\.com\.np$/
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  app.setGlobalPrefix('/api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Banau Backend API')
    .setDescription('Production-ready API for exploring the Banau.')
    .setVersion('1.0')
    .addTag('Authentication', 'User registration and login')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use('/openapi.json', (req, res) => {
    res.json(document);
  });
  // ✅ Also write the Swagger JSON file for frontend codegen
  try {
    const outputPath = path.join(process.cwd(), 'openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    logger.log(`📄 Swagger schema generated at: ${outputPath}`);
  } catch (error) {
    logger.error('❌ Failed to write Swagger schema file', error);
  }
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
