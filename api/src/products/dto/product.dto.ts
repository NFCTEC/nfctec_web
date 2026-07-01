import { Allow, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Locale, ProductCategory, PublishStatus } from '@prisma/client';

export class CreateProductDto {
  @IsEnum(Locale)
  locale: Locale;

  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  intro?: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  heroImage?: string;

  @Allow()
  @IsOptional()
  images?: unknown;

  @Allow()
  @IsOptional()
  features?: unknown;

  @Allow()
  @IsOptional()
  specs?: unknown;

  @Allow()
  @IsOptional()
  useCases?: unknown;

  @Allow()
  @IsOptional()
  highlights?: unknown;

  @IsString()
  @IsOptional()
  body?: string;

  @IsBoolean()
  @IsOptional()
  hasDetailPage?: boolean;

  @IsString()
  @IsOptional()
  ctaUrl?: string;

  @IsString()
  @IsOptional()
  ctaLabel?: string;

  @IsString()
  @IsOptional()
  secondaryCtaUrl?: string;

  @IsString()
  @IsOptional()
  secondaryCtaLabel?: string;

  @IsInt()
  @Min(0)
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

export class UpdateProductDto {
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
  description?: string;

  @IsString()
  @IsOptional()
  tagline?: string | null;

  @IsString()
  @IsOptional()
  intro?: string | null;

  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  heroImage?: string | null;

  @Allow()
  @IsOptional()
  images?: unknown;

  @Allow()
  @IsOptional()
  features?: unknown;

  @Allow()
  @IsOptional()
  specs?: unknown;

  @Allow()
  @IsOptional()
  useCases?: unknown;

  @Allow()
  @IsOptional()
  highlights?: unknown;

  @IsString()
  @IsOptional()
  body?: string;

  @IsBoolean()
  @IsOptional()
  hasDetailPage?: boolean;

  @IsString()
  @IsOptional()
  ctaUrl?: string | null;

  @IsString()
  @IsOptional()
  ctaLabel?: string | null;

  @IsString()
  @IsOptional()
  secondaryCtaUrl?: string | null;

  @IsString()
  @IsOptional()
  secondaryCtaLabel?: string | null;

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
