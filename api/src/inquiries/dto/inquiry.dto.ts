import { IsEnum, IsOptional } from 'class-validator';
import { InquiryStatus } from '@prisma/client';

export class UpdateInquiryDto {
  @IsEnum(InquiryStatus)
  @IsOptional()
  status?: InquiryStatus;
}
