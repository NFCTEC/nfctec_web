import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PostsModule } from '../posts/posts.module';
import { SolutionsModule } from '../solutions/solutions.module';
import { ProductsModule } from '../products/products.module';
import { DownloadsModule } from '../downloads/downloads.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';

@Module({
  imports: [
    PostsModule,
    SolutionsModule,
    ProductsModule,
    DownloadsModule,
    SiteSettingsModule,
  ],
  controllers: [PublicController],
})
export class PublicModule {}
