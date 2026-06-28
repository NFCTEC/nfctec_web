import { Injectable, NotFoundException } from '@nestjs/common';
import { Locale, ProductCategory, PublishStatus } from '@prisma/client';
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
    return this.prisma.product.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureExists(id);
    return this.prisma.product.update({ where: { id }, data: dto });
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

  private async ensureExists(id: string) {
    if (!(await this.prisma.product.count({ where: { id } }))) {
      throw new NotFoundException('Product not found');
    }
  }
}
