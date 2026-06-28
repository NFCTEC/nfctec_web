import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Locale, ProductCategory } from '@prisma/client';
import { Public } from '../common/decorators';
import { PostsService } from '../posts/posts.service';
import { SolutionsService } from '../solutions/solutions.service';
import { ProductsService } from '../products/products.service';
import { DownloadsService } from '../downloads/downloads.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
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

  @Get('downloads')
  listDownloads(@Query('locale') locale: Locale = Locale.en) {
    return this.downloads.findPublished(locale);
  }

  @Get('site-settings')
  getSettings(@Query('locale') locale: Locale = Locale.en) {
    return this.settings.findPublic(locale);
  }

  @Get('sitemap')
  async sitemap() {
    const siteUrl = this.config.get('PUBLIC_SITE_URL', 'https://www.nfctec.com');
    const [posts, solutions] = await Promise.all([
      this.prisma.post.findMany({
        where: { status: 'published' },
        select: { locale: true, slug: true, updatedAt: true },
      }),
      this.prisma.solution.findMany({
        where: { status: 'published' },
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
    return { urls };
  }

  @Post('inquiries')
  createInquiry(@Body() dto: CreateInquiryDto) {
    return this.prisma.inquiry.create({ data: dto });
  }
}
