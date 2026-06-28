import { Injectable, NotFoundException } from '@nestjs/common';
import { Locale, Prisma, PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSolutionDto, UpdateSolutionDto } from './dto/solution.dto';

@Injectable()
export class SolutionsService {
  constructor(private prisma: PrismaService) {}

  findAllAdmin(filters?: { locale?: Locale; status?: PublishStatus }) {
    return this.prisma.solution.findMany({
      where: { locale: filters?.locale, status: filters?.status },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  findOneAdmin(id: string) {
    return this.prisma.solution.findUniqueOrThrow({ where: { id } });
  }

  create(dto: CreateSolutionDto) {
    return this.prisma.solution.create({
      data: this.toCreateData(dto),
    });
  }

  async update(id: string, dto: UpdateSolutionDto) {
    await this.ensureExists(id);
    return this.prisma.solution.update({
      where: { id },
      data: this.toUpdateData(dto),
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.solution.delete({ where: { id } });
  }

  findPublished(locale: Locale) {
    return this.prisma.solution.findMany({
      where: { locale, status: PublishStatus.published },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findPublishedBySlug(locale: Locale, slug: string) {
    const row = await this.prisma.solution.findFirst({
      where: { locale, slug, status: PublishStatus.published },
    });
    if (!row) throw new NotFoundException('Solution not found');
    return row;
  }

  private toCreateData(dto: CreateSolutionDto): Prisma.SolutionCreateInput {
    return {
      locale: dto.locale,
      slug: dto.slug,
      name: dto.name,
      tagline: dto.tagline,
      intro: dto.intro,
      icon: dto.icon,
      heroImage: dto.heroImage,
      capabilities: (dto.capabilities ?? []) as Prisma.InputJsonValue,
      deliverables: (dto.deliverables ?? []) as Prisma.InputJsonValue,
      protocols: (dto.protocols ?? []) as Prisma.InputJsonValue,
      certifications: (dto.certifications ?? []) as Prisma.InputJsonValue,
      workflow: (dto.workflow ?? []) as Prisma.InputJsonValue,
      resources: (dto.resources ?? []) as Prisma.InputJsonValue,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      ogImage: dto.ogImage,
    };
  }

  private toUpdateData(dto: UpdateSolutionDto): Prisma.SolutionUpdateInput {
    const json = (v: unknown) =>
      v === undefined ? undefined : (v as Prisma.InputJsonValue);
    return {
      locale: dto.locale,
      slug: dto.slug,
      name: dto.name,
      tagline: dto.tagline,
      intro: dto.intro,
      icon: dto.icon,
      heroImage: dto.heroImage,
      capabilities: json(dto.capabilities),
      deliverables: json(dto.deliverables),
      protocols: json(dto.protocols),
      certifications: json(dto.certifications),
      workflow: json(dto.workflow),
      resources: json(dto.resources),
      sortOrder: dto.sortOrder,
      status: dto.status,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      ogImage: dto.ogImage,
    };
  }

  private async ensureExists(id: string) {
    if (!(await this.prisma.solution.count({ where: { id } }))) {
      throw new NotFoundException('Solution not found');
    }
  }
}
