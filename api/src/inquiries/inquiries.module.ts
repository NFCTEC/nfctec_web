import { Module } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { InquiriesAdminController } from './inquiries-admin.controller';

@Module({
  controllers: [InquiriesAdminController],
  providers: [InquiriesService],
  exports: [InquiriesService],
})
export class InquiriesModule {}
