import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { InquiriesModule } from '../inquiries/inquiries.module';

@Module({
  imports: [InquiriesModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
