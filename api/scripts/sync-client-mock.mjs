import { PrismaClient, Locale, ProductCategory, PublishStatus } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(scriptDir, '..');
const repoRoot = resolve(apiRoot, '..');
const clientRoot = resolve(repoRoot, '..', 'client-site-muse');
const clientMockPath = resolve(clientRoot, 'src', 'lib', 'cms-mock.ts');
const clientPublicRoot = resolve(clientRoot, 'public');

function loadEnv() {
  const envPath = join(apiRoot, '.env');
  if (!existsSync(envPath)) return;
  const rows = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const row of rows) {
    const trimmed = row.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function loadMockResponse() {
  if (!existsSync(clientMockPath)) {
    throw new Error(`Cannot find client mock file: ${clientMockPath}`);
  }

  const source = readFileSync(clientMockPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => !line.startsWith('import '))
    .join('\n');

  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;

  const module = { exports: {} };
  const fn = new Function('exports', 'module', compiled);
  fn(module.exports, module);
  if (typeof module.exports.mockResponse !== 'function') {
    throw new Error('mockResponse export not found in cms-mock.ts');
  }
  return module.exports.mockResponse;
}

function asLocale(value) {
  return value === 'zh' ? Locale.zh : Locale.en;
}

function asProductCategory(value) {
  return value === 'hardware' ? ProductCategory.hardware : ProductCategory.software;
}

function existingPublicPath(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('/')) return null;
  const localPath = join(clientPublicRoot, url.slice(1));
  return existsSync(localPath) ? url : null;
}

async function syncSolutions(prisma, mockResponse, locale) {
  const solutions = mockResponse(`/public/solutions?locale=${locale}`);
  for (const item of solutions) {
    const heroImage = existingPublicPath(item.heroImage);
    await prisma.solution.upsert({
      where: { locale_slug: { locale: asLocale(locale), slug: item.slug } },
      update: {
        name: item.name,
        tagline: item.tagline,
        intro: item.intro,
        icon: item.icon ?? 'Boxes',
        heroImage,
        capabilities: item.capabilities ?? [],
        deliverables: item.deliverables ?? [],
        protocols: item.protocols ?? [],
        certifications: item.certifications ?? [],
        workflow: item.workflow ?? [],
        resources: item.resources ?? [],
        sortOrder: item.sortOrder ?? 0,
        status: PublishStatus.published,
        seoTitle: item.seoTitle ?? null,
        seoDescription: item.seoDescription ?? null,
        ogImage: existingPublicPath(item.ogImage) ?? heroImage,
      },
      create: {
        locale: asLocale(locale),
        slug: item.slug,
        name: item.name,
        tagline: item.tagline,
        intro: item.intro,
        icon: item.icon ?? 'Boxes',
        heroImage,
        capabilities: item.capabilities ?? [],
        deliverables: item.deliverables ?? [],
        protocols: item.protocols ?? [],
        certifications: item.certifications ?? [],
        workflow: item.workflow ?? [],
        resources: item.resources ?? [],
        sortOrder: item.sortOrder ?? 0,
        status: PublishStatus.published,
        seoTitle: item.seoTitle ?? null,
        seoDescription: item.seoDescription ?? null,
        ogImage: existingPublicPath(item.ogImage) ?? heroImage,
      },
    });
  }
  return solutions.length;
}

async function syncProducts(prisma, mockResponse, locale) {
  const products = mockResponse(`/public/products?locale=${locale}`);
  for (const item of products) {
    await prisma.product.upsert({
      where: { locale_slug: { locale: asLocale(locale), slug: item.slug } },
      update: {
        name: item.name,
        description: item.description,
        tagline: item.tagline ?? null,
        intro: item.intro ?? null,
        category: asProductCategory(item.category),
        icon: item.icon ?? 'Boxes',
        heroImage: item.heroImage ?? null,
        images: item.images ?? [],
        features: item.features ?? [],
        specs: item.specs ?? [],
        useCases: item.useCases ?? [],
        highlights: item.highlights ?? [],
        body: item.body ?? '',
        hasDetailPage: Boolean(item.hasDetailPage),
        ctaUrl: item.ctaUrl ?? null,
        ctaLabel: item.ctaLabel ?? null,
        secondaryCtaUrl: item.secondaryCtaUrl ?? null,
        secondaryCtaLabel: item.secondaryCtaLabel ?? null,
        sortOrder: item.sortOrder ?? 0,
        status: PublishStatus.published,
        seoTitle: item.seoTitle ?? null,
        seoDescription: item.seoDescription ?? null,
        ogImage: item.ogImage ?? null,
      },
      create: {
        locale: asLocale(locale),
        slug: item.slug,
        name: item.name,
        description: item.description,
        tagline: item.tagline ?? null,
        intro: item.intro ?? null,
        category: asProductCategory(item.category),
        icon: item.icon ?? 'Boxes',
        heroImage: item.heroImage ?? null,
        images: item.images ?? [],
        features: item.features ?? [],
        specs: item.specs ?? [],
        useCases: item.useCases ?? [],
        highlights: item.highlights ?? [],
        body: item.body ?? '',
        hasDetailPage: Boolean(item.hasDetailPage),
        ctaUrl: item.ctaUrl ?? null,
        ctaLabel: item.ctaLabel ?? null,
        secondaryCtaUrl: item.secondaryCtaUrl ?? null,
        secondaryCtaLabel: item.secondaryCtaLabel ?? null,
        sortOrder: item.sortOrder ?? 0,
        status: PublishStatus.published,
        seoTitle: item.seoTitle ?? null,
        seoDescription: item.seoDescription ?? null,
        ogImage: item.ogImage ?? null,
      },
    });
  }
  return products.length;
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient();
  const mockResponse = loadMockResponse();

  try {
    for (const locale of ['en', 'zh']) {
      const solutionCount = await syncSolutions(prisma, mockResponse, locale);
      const productCount = await syncProducts(prisma, mockResponse, locale);
      console.log(`Synced ${locale}: ${solutionCount} solutions, ${productCount} products`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
