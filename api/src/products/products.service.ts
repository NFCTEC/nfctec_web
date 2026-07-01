import { Injectable, NotFoundException } from '@nestjs/common';
import { Locale, Prisma, ProductCategory, PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAllAdmin(filters?: {
    locale?: Locale;
    status?: PublishStatus;
    category?: ProductCategory;
  }) {
    return this.prisma.product.findMany({
      where: filters,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  findOneAdmin(id: string) {
    return this.prisma.product.findUniqueOrThrow({ where: { id } });
  }

  create(dto: CreateProductDto) {
    const { images, features, specs, useCases, highlights, ...rest } = dto;
    return this.prisma.product.create({
      data: {
        ...rest,
        images: (images ?? []) as Prisma.InputJsonValue,
        features: (features ?? []) as Prisma.InputJsonValue,
        specs: (specs ?? []) as Prisma.InputJsonValue,
        useCases: (useCases ?? []) as Prisma.InputJsonValue,
        highlights: (highlights ?? []) as Prisma.InputJsonValue,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureExists(id);
    const { images, features, specs, useCases, highlights, ...rest } = dto;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(images !== undefined ? { images: images as Prisma.InputJsonValue } : {}),
        ...(features !== undefined ? { features: features as Prisma.InputJsonValue } : {}),
        ...(specs !== undefined ? { specs: specs as Prisma.InputJsonValue } : {}),
        ...(useCases !== undefined ? { useCases: useCases as Prisma.InputJsonValue } : {}),
        ...(highlights !== undefined ? { highlights: highlights as Prisma.InputJsonValue } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.product.delete({ where: { id } });
  }

  findPublished(locale: Locale, category?: ProductCategory) {
    return this.prisma.product.findMany({
      where: {
        locale,
        status: PublishStatus.published,
        category,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findPublishedBySlug(locale: Locale, slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        locale,
        slug,
        status: PublishStatus.published,
        hasDetailPage: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private async ensureExists(id: string) {
    if (!(await this.prisma.product.count({ where: { id } }))) {
      throw new NotFoundException('Product not found');
    }
  }
}
