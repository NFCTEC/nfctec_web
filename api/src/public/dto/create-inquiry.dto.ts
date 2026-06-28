import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @MinLength(1)
  subject: string;

  @IsString()
  @MinLength(1)
  message: string;
}
