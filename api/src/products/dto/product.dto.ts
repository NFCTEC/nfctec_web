import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
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

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsString()
  @IsOptional()
  linkPath?: string;

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

  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @IsString()
  @IsOptional()
  linkPath?: string | null;

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
}
