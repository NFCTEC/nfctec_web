import { Body, Controller, Get, Param, Post, Query, Req, Res } from '@nestjs/common';
import { Locale, ProductCategory } from '@prisma/client';
import type { Request, Response } from 'express';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { Public } from '../common/decorators';
import { contentDispositionHeader } from '../downloads/download-filename';
import { PostsService } from '../posts/posts.service';
import { SolutionsService } from '../solutions/solutions.service';
import { ProductsService } from '../products/products.service';
import { DownloadsService } from '../downloads/downloads.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { InquiriesService } from '../inquiries/inquiries.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { RecordPostViewDto } from './dto/record-post-view.dto';
import { ConfigService } from '@nestjs/config';

@Public()
@Controller('public')
export class PublicController {
  constructor(
    private posts: PostsService,
    private solutions: SolutionsService,
    private products: ProductsService,
    private downloads: DownloadsService,
    private settings: SiteSettingsService,
    private prisma: PrismaService,
    private inquiries: InquiriesService,
    private config: ConfigService,
  ) {}

  @Get('posts')
  listPosts(@Query('locale') locale: Locale = Locale.en) {
    return this.posts.findPublished(locale);
  }

  @Get('posts/:slug')
  getPost(@Param('slug') slug: string, @Query('locale') locale: Locale = Locale.en) {
    return this.posts.findPublishedBySlug(locale, slug);
  }

  @Post('posts/:slug/view')
  recordPostView(
    @Param('slug') slug: string,
    @Query('locale') locale: Locale = Locale.en,
    @Body() dto: RecordPostViewDto,
    @Req() req: Request,
  ) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      (typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : undefined) ??
      req.ip ??
      req.socket.remoteAddress;

    return this.posts.recordView(locale, slug, {
      viewerId: dto.viewerId,
      ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Get('solutions')
  listSolutions(@Query('locale') locale: Locale = Locale.en) {
    return this.solutions.findPublished(locale);
  }

  @Get('solutions/:slug')
  getSolution(
    @Param('slug') slug: string,
    @Query('locale') locale: Locale = Locale.en,
  ) {
    return this.solutions.findPublishedBySlug(locale, slug);
  }

  @Get('products')
  listProducts(
    @Query('locale') locale: Locale = Locale.en,
    @Query('category') category?: ProductCategory,
  ) {
    return this.products.findPublished(locale, category);
  }

  @Get('products/:slug')
  getProduct(@Param('slug') slug: string, @Query('locale') locale: Locale = Locale.en) {
    return this.products.findPublishedBySlug(locale, slug);
  }

  @Get('display-config')
  getDisplayConfig(@Query('locale') locale: Locale = Locale.en) {
    return this.settings.getDisplayConfig(locale);
  }

  @Get('downloads')
  listDownloads(@Query('locale') locale: Locale = Locale.en) {
    return this.downloads.findPublished(locale);
  }

  @Get('downloads/items/:id/file')
  async downloadFile(
    @Param('id') id: string,
    @Query('locale') locale: Locale = Locale.en,
    @Res() res: Response,
  ) {
    const file = await this.downloads.prepareDownload(id, locale);

    if (file.localPath) {
      return res.download(file.localPath, file.fileName);
    }

    const upstream = await fetch(file.fileUrl);
    if (!upstream.ok) {
      res.status(404).json({ statusCode: 404, message: 'File not available' });
      return;
    }

    res.setHeader('Content-Disposition', contentDispositionHeader(file.fileName));
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.status(200);

    if (!upstream.body) {
      res.end();
      return;
    }

    await pipeline(Readable.fromWeb(upstream.body as Parameters<typeof Readable.fromWeb>[0]), res);
  }

  @Get('site-settings')
  getSettings(@Query('locale') locale: Locale = Locale.en) {
    return this.settings.findPublic(locale);
  }

  @Get('sitemap')
  async sitemap() {
    const siteUrl = this.config.get('PUBLIC_SITE_URL', 'https://www.nfctec.com');
    const [posts, solutions, productsWithDetail] = await Promise.all([
      this.prisma.post.findMany({
        where: { status: 'published' },
        select: { locale: true, slug: true, updatedAt: true },
      }),
      this.prisma.solution.findMany({
        where: { status: 'published' },
        select: { locale: true, slug: true, updatedAt: true },
      }),
      this.prisma.product.findMany({
        where: { status: 'published', hasDetailPage: true },
        select: { locale: true, slug: true, updatedAt: true },
      }),
    ]);

    const staticPaths = [
      '',
      '/products',
      '/products/nfc-field-detector',
      '/solutions',
      '/platform',
      '/downloads',
      '/blog',
      '/about',
      '/contact',
    ];

    const urls: { loc: string; lastmod?: string }[] = [];
    for (const locale of ['en', 'zh'] as const) {
      for (const path of staticPaths) {
        urls.push({ loc: `${siteUrl}/${locale}${path}` });
      }
    }
    for (const p of posts) {
      urls.push({
        loc: `${siteUrl}/${p.locale}/blog/${p.slug}`,
        lastmod: p.updatedAt.toISOString(),
      });
    }
    for (const s of solutions) {
      urls.push({
        loc: `${siteUrl}/${s.locale}/solutions/${s.slug}`,
        lastmod: s.updatedAt.toISOString(),
      });
    }
    for (const p of productsWithDetail) {
      urls.push({
        loc: `${siteUrl}/${p.locale}/products/${p.slug}`,
        lastmod: p.updatedAt.toISOString(),
      });
    }
    return { urls };
  }

  @Post('inquiries')
  createInquiry(@Body() dto: CreateInquiryDto) {
    return this.inquiries.createFromWebsite(dto);
  }
}
