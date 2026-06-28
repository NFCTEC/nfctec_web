import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsAdminController } from './posts-admin.controller';

@Module({
  controllers: [PostsAdminController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
