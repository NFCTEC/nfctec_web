import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Locale, PublishStatus } from '@prisma/client';

export class CreatePostDto {
  @IsEnum(Locale)
  locale: Locale;

  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  excerpt: string;

  body: unknown;

  @IsString()
  category: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  readMinutes?: number;

  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus;

  @IsISO8601()
  @IsOptional()
  publishedAt?: string;

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  @IsString()
  @IsOptional()
  ogImage?: string;
}

export class UpdatePostDto {
  @IsEnum(Locale)
  @IsOptional()
  locale?: Locale;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsOptional()
  body?: unknown;

  @IsString()
  @IsOptional()
  category?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  readMinutes?: number;

  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus;

  @IsISO8601()
  @IsOptional()
  publishedAt?: string | null;

  @IsString()
  @IsOptional()
  seoTitle?: string | null;

  @IsString()
  @IsOptional()
  seoDescription?: string | null;

  @IsString()
  @IsOptional()
  ogImage?: string | null;
}
