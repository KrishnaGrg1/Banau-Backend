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
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    TenantModule,
    EmailModule,
    AdminModule,
    SettingModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SubdomainMiddleware).forRoutes('*');
  }
}
