import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TenantModule } from './tenant/tenant.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { SubdomainMiddleware } from './common/middleware/subdomain.middleware';
import { EmailModule } from './email/email.module';
import { AdminModule } from './admin/admin.module';
import { SettingModule } from './setting/setting.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProductsModule } from './products/products.module';
import { PublicProductsModule } from './public-products/public-products.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    EmailModule,
    AdminModule,
    CloudinaryModule,
    SettingModule,
    TenantModule,
    ProductsModule,
    PublicProductsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SubdomainMiddleware).forRoutes('*');
  }
}
