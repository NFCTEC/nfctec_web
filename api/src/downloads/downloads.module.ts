import { Module } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { DownloadsAdminController } from './downloads-admin.controller';

@Module({
  controllers: [DownloadsAdminController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
