import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { Locale, PublishStatus } from '@prisma/client';

export class CreateDownloadGroupDto {
  @IsEnum(Locale)
  locale: Locale;

  @IsString()
  @MinLength(1)
  name: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class UpdateDownloadGroupDto {
  @IsEnum(Locale)
  @IsOptional()
  locale?: Locale;

  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class CreateDownloadItemDto {
  @IsUUID()
  groupId: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  fileSize?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus;
}

export class UpdateDownloadItemDto {
  @IsUUID()
  @IsOptional()
  groupId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  version?: string | null;

  @IsString()
  @IsOptional()
  fileUrl?: string | null;

  @IsString()
  @IsOptional()
  fileSize?: string | null;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus;
}
