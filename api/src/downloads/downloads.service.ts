import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Locale, Prisma, PublishStatus } from '@prisma/client';
import { existsSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { buildDownloadFilename } from './download-filename';
import {
  CreateDownloadGroupDto,
  CreateDownloadItemDto,
  UpdateDownloadGroupDto,
  UpdateDownloadItemDto,
} from './dto/download.dto';

export type PreparedDownload = {
  fileUrl: string;
  fileName: string;
  localPath: string | null;
};

type DownloadItemRow = {
  id: string;
  groupId: string;
  name: string;
  version: string | null;
  fileUrl: string | null;
  fileSize: string | null;
  sortOrder: number;
  status: PublishStatus;
  createdAt: Date;
  updatedAt: Date;
  downloadCount: number;
};

type DownloadGroupRow = {
  id: string;
  locale: Locale;
  name: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  items: DownloadItemRow[];
};

@Injectable()
export class DownloadsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async findGroupsAdmin(locale?: Locale): Promise<DownloadGroupRow[]> {
    const groups = await this.prisma.downloadGroup.findMany({
      where: { locale },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
    return this.attachDownloadCounts(groups);
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

  async findPublished(locale: Locale): Promise<DownloadGroupRow[]> {
    const groups = await this.prisma.downloadGroup.findMany({
      where: { locale },
      include: {
        items: {
          where: { status: PublishStatus.published },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    const withCounts = await this.attachDownloadCounts(groups);
    return withCounts;
  }

  async prepareDownload(itemId: string, locale: Locale): Promise<PreparedDownload> {
    const item = await this.prisma.downloadItem.findFirst({
      where: {
        id: itemId,
        status: PublishStatus.published,
        fileUrl: { not: null },
        group: { locale },
      },
      select: { id: true, name: true, fileUrl: true },
    });
    if (!item?.fileUrl) throw new NotFoundException('Download not found');

    await this.prisma.$executeRaw`
      UPDATE "download_items"
      SET "download_count" = "download_count" + 1
      WHERE "id" = ${itemId}
    `;

    const media = await this.prisma.media.findFirst({
      where: { url: item.fileUrl },
      select: { filename: true },
    });
    const fileName = media?.filename ?? buildDownloadFilename(item.name, item.fileUrl);

    return {
      fileUrl: item.fileUrl,
      fileName,
      localPath: this.resolveLocalUploadPath(item.fileUrl),
    };
  }

  resolveLocalUploadPath(fileUrl: string): string | null {
    const uploadDir = this.config.get<string>('UPLOAD_DIR') ?? join(process.cwd(), 'uploads');
    let pathname = fileUrl;
    try {
      pathname = new URL(fileUrl).pathname;
    } catch {
      /* relative URL */
    }
    const match = pathname.match(/\/uploads\/([^/?#]+)$/);
    if (!match) return null;
    const local = join(uploadDir, match[1]);
    return existsSync(local) ? local : null;
  }

  private async attachDownloadCounts<
    T extends { items: { id: string }[] },
  >(groups: T[]): Promise<(T & { items: (T['items'][number] & { downloadCount: number })[] })[]> {
    const itemIds = groups.flatMap((g) => g.items.map((i) => i.id));
    if (itemIds.length === 0) return groups as never;

    const counts = await this.prisma.$queryRaw<Array<{ id: string; download_count: number }>>`
      SELECT id, download_count FROM "download_items" WHERE id IN (${Prisma.join(itemIds)})
    `;
    const countMap = new Map(counts.map((c) => [c.id, Number(c.download_count)]));

    return groups.map((g) => ({
      ...g,
      items: g.items.map((item) => ({
        ...item,
        downloadCount: countMap.get(item.id) ?? 0,
      })),
    })) as never;
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
