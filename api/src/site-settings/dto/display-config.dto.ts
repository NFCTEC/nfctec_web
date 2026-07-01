import { Allow, IsEnum } from 'class-validator';
import { Locale } from '@prisma/client';

export class UpsertDisplayConfigDto {
  @IsEnum(Locale)
  locale: Locale;

  @Allow()
  config: unknown;
}
