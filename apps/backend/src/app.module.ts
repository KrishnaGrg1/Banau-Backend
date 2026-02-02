import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WebsiteModule } from './website/website.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { SubdomainMiddleware } from './common/middleware/subdomain.middleware';
@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, WebsiteModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SubdomainMiddleware).forRoutes('*');
  }
}
