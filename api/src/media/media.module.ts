import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaAdminController } from './media-admin.controller';

@Module({
  controllers: [MediaAdminController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
