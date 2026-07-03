import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { InquiriesService } from './inquiries.service';
import { InquiriesAdminController } from './inquiries-admin.controller';

@Module({
  imports: [MailModule],
  controllers: [InquiriesAdminController],
  providers: [InquiriesService],
  exports: [InquiriesService],
})
export class InquiriesModule {}
