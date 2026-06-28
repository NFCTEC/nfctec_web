import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { SolutionsModule } from './solutions/solutions.module';
import { ProductsModule } from './products/products.module';
import { DownloadsModule } from './downloads/downloads.module';
import { MediaModule } from './media/media.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PublicModule } from './public/public.module';
import { HealthController } from './health.controller';
import { JwtGlobalGuard, RolesGuard } from './common/guards';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PostsModule,
    SolutionsModule,
    ProductsModule,
    DownloadsModule,
    MediaModule,
    InquiriesModule,
    SiteSettingsModule,
    UsersModule,
    DashboardModule,
    PublicModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtGlobalGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
