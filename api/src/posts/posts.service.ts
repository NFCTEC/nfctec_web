import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { Locale, Prisma, PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  findAllAdmin(filters?: { locale?: Locale; status?: PublishStatus }) {
    return this.prisma.post.findMany({
      where: {
        locale: filters?.locale,
        status: filters?.status,
      },
      orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  findOneAdmin(id: string) {
    return this.prisma.post.findUniqueOrThrow({ where: { id } });
  }

  async create(dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        ...dto,
        body: dto.body as Prisma.InputJsonValue,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      },
    });
  }

  async update(id: string, dto: UpdatePostDto) {
    await this.ensureExists(id);
    const { publishedAt, body, ...rest } = dto;
    return this.prisma.post.update({
      where: { id },
      data: {
        ...rest,
        ...(body !== undefined ? { body: body as Prisma.InputJsonValue } : {}),
        ...(publishedAt !== undefined
          ? { publishedAt: publishedAt ? new Date(publishedAt) : null }
          : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.post.delete({ where: { id } });
  }

  findPublished(locale: Locale) {
    return this.prisma.post.findMany({
      where: { locale, status: PublishStatus.published },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findPublishedBySlug(locale: Locale, slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { locale, slug, status: PublishStatus.published },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async recordView(
    locale: Locale,
    slug: string,
    ctx: { viewerId?: string; ip?: string; userAgent?: string },
  ) {
    const post = await this.prisma.post.findFirst({
      where: { locale, slug, status: PublishStatus.published },
      select: { id: true, viewCount: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    const viewerKey = ctx.viewerId
      ? ctx.viewerId
      : createHash('sha256')
          .update(`${ctx.ip ?? 'unknown'}|${ctx.userAgent ?? ''}`)
          .digest('hex');

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await this.prisma.postView.findFirst({
      where: {
        postId: post.id,
        viewerKey,
        viewedAt: { gte: since },
      },
    });

    if (recent) {
      return { viewCount: post.viewCount, recorded: false };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.postView.create({
        data: { postId: post.id, viewerKey },
      });
      return tx.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true },
      });
    });

    return { viewCount: updated.viewCount, recorded: true };
  }

  private async ensureExists(id: string) {
    const count = await this.prisma.post.count({ where: { id } });
    if (!count) throw new NotFoundException('Post not found');
  }
}
