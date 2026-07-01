import { Allow, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Locale, PublishStatus } from '@prisma/client';

export class CreateSolutionDto {
  @IsEnum(Locale)
  locale: Locale;

  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  name: string;

  @IsString()
  tagline: string;

  @IsString()
  intro: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  heroImage?: string;

  @Allow()
  @IsOptional()
  capabilities?: unknown;

  @Allow()
  @IsOptional()
  deliverables?: unknown;

  @Allow()
  @IsOptional()
  protocols?: unknown;

  @Allow()
  @IsOptional()
  certifications?: unknown;

  @Allow()
  @IsOptional()
  workflow?: unknown;

  @Allow()
  @IsOptional()
  resources?: unknown;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus;

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

export class UpdateSolutionDto {
  @IsEnum(Locale)
  @IsOptional()
  locale?: Locale;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  intro?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  heroImage?: string | null;

  @Allow()
  @IsOptional()
  capabilities?: unknown;

  @Allow()
  @IsOptional()
  deliverables?: unknown;

  @Allow()
  @IsOptional()
  protocols?: unknown;

  @Allow()
  @IsOptional()
  certifications?: unknown;

  @Allow()
  @IsOptional()
  workflow?: unknown;

  @Allow()
  @IsOptional()
  resources?: unknown;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus;

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
