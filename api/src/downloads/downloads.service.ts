import { Injectable, NotFoundException } from '@nestjs/common';
import { Locale, PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDownloadGroupDto,
  CreateDownloadItemDto,
  UpdateDownloadGroupDto,
  UpdateDownloadItemDto,
} from './dto/download.dto';

@Injectable()
export class DownloadsService {
  constructor(private prisma: PrismaService) {}

  findGroupsAdmin(locale?: Locale) {
    return this.prisma.downloadGroup.findMany({
      where: { locale },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  createGroup(dto: CreateDownloadGroupDto) {
    return this.prisma.downloadGroup.create({ data: dto });
  }

  async updateGroup(id: string, dto: UpdateDownloadGroupDto) {
    await this.ensureGroup(id);
    return this.prisma.downloadGroup.update({ where: { id }, data: dto });
  }

  async removeGroup(id: string) {
    await this.ensureGroup(id);
    return this.prisma.downloadGroup.delete({ where: { id } });
  }

  createItem(dto: CreateDownloadItemDto) {
    return this.prisma.downloadItem.create({ data: dto });
  }

  async updateItem(id: string, dto: UpdateDownloadItemDto) {
    await this.ensureItem(id);
    return this.prisma.downloadItem.update({ where: { id }, data: dto });
  }

  async removeItem(id: string) {
    await this.ensureItem(id);
    return this.prisma.downloadItem.delete({ where: { id } });
  }

  findPublished(locale: Locale) {
    return this.prisma.downloadGroup.findMany({
      where: { locale },
      include: {
        items: {
          where: { status: PublishStatus.published },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  private async ensureGroup(id: string) {
    if (!(await this.prisma.downloadGroup.count({ where: { id } }))) {
      throw new NotFoundException('Download group not found');
    }
  }

  private async ensureItem(id: string) {
    if (!(await this.prisma.downloadItem.count({ where: { id } }))) {
      throw new NotFoundException('Download item not found');
    }
  }
}
