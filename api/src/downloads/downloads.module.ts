import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DownloadsService } from './downloads.service';
import { DownloadsAdminController } from './downloads-admin.controller';

@Module({
  imports: [ConfigModule],
  controllers: [DownloadsAdminController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
