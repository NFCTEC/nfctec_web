import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Locale } from '@prisma/client';

export class UpsertSiteSettingDto {
  @IsString()
  key: string;

  @IsEnum(Locale)
  @IsOptional()
  locale?: Locale | null;

  value: unknown;
}
