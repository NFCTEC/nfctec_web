import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InquiryStatus } from '@prisma/client';
import { InquiriesService } from './inquiries.service';
import { UpdateInquiryDto } from './dto/inquiry.dto';

@Controller('admin/inquiries')
@UseGuards(AuthGuard('jwt'))
export class InquiriesAdminController {
  constructor(private inquiries: InquiriesService) {}

  @Get()
  list(@Query('status') status?: InquiryStatus) {
    return this.inquiries.findAllAdmin(status);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.inquiries.update(id, dto);
  }
}
