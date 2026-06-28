/**
 * One-time import: reads frontend blog posts + solutions data into PostgreSQL.
 * Run: node scripts/import-cms-content.mjs  (from api/, with DATABASE_URL set)
 */
import { PrismaClient, PublishStatus } from '@prisma/client';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const prisma = new PrismaClient();

function extractBalanced(src, constName, openChar) {
  const closeChar = openChar === '[' ? ']' : '}';
  const marker = `const ${constName}`;
  const idx = src.indexOf(marker);
  if (idx === -1) return null;
  const eq = src.indexOf('=', idx);
  const start = src.indexOf(openChar, eq);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === openChar) depth++;
    if (src[i] === closeChar) depth--;
    if (depth === 0) return src.slice(start, i + 1);
  }
  return null;
}

// Blog posts from frontend
const blogPath = join(__dirname, '../../../client-site-muse/src/lib/blog-posts.ts');
const blogSrc = readFileSync(blogPath, 'utf8');
const postsMatch = blogSrc.match(/export const posts: BlogPost\[\] = (\[[\s\S]*?\]);/);
if (!postsMatch) throw new Error('Could not parse blog posts');
const posts = eval(postsMatch[1]);

// Solutions from $locale route file (legacy embedded data)
const solPath = join(__dirname, '../../../client-site-muse/scripts/import-data/solutions.$slug.tsx');
let solSrc = readFileSync(solPath, 'utf8');
solSrc = solSrc.replace(/icon: (\w+)/g, 'icon: "$1"');

const baseIndustries = eval(extractBalanced(solSrc, 'baseIndustries', '['));
const defaultWorkflow = eval(extractBalanced(solSrc, 'defaultWorkflow', '['));
const defaultResources = eval(extractBalanced(solSrc, 'defaultResources', '['));
const extrasMapRaw = extractBalanced(solSrc, 'extrasMap', '{');
const extrasMap = new Function('defaultWorkflow', 'defaultResources', `return ${extrasMapRaw}`)(
  defaultWorkflow,
  defaultResources,
);
if (!baseIndustries || !extrasMap) throw new Error('Could not parse solutions');

const SLUG_IMAGES = {
  banking: '/solutions/banking.jpg',
  transit: '/solutions/transit.jpg',
  gov: '/solutions/gov.jpg',
  access: '/solutions/access.jpg',
  health: '/solutions/health.jpg',
  iot: '/solutions/iot.jpg',
  brand: '/solutions/brand.jpg',
  retail: '/solutions/retail.jpg',
  auto: '/solutions/auto.jpg',
  wallet: '/solutions/wallet.jpg',
  security: '/solutions/security.jpg',
};

function pickBi(b, locale) {
  return typeof b === 'string' ? b : b[locale];
}

function mapCaps(caps, locale) {
  return caps.map((c) => ({ title: pickBi(c.t, locale), description: pickBi(c.d, locale) }));
}

function mapSteps(steps, locale) {
  return steps.map((s) => ({ title: pickBi(s.t, locale), description: pickBi(s.d, locale) }));
}

function mapResources(res, locale) {
  return res.map((r) => ({ title: pickBi(r.t, locale), kind: pickBi(r.kind, locale) }));
}

async function main() {
  for (const p of posts) {
    for (const locale of ['en', 'zh']) {
      await prisma.post.upsert({
        where: { locale_slug: { locale, slug: p.slug } },
        update: {},
        create: {
          locale,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          body: p.body,
          category: p.cat,
          readMinutes: p.readMinutes,
          status: PublishStatus.published,
          publishedAt: new Date(p.date),
          seoTitle: `${p.title} — NFCTEC Blog`,
        },
      });
    }
  }
  console.log(`Imported ${posts.length} blog posts (en+zh)`);

  let order = 0;
  for (const b of baseIndustries) {
    const extras = extrasMap[b.slug] ?? {
      certifications: [],
      workflow: defaultWorkflow,
      resources: defaultResources,
    };
    for (const locale of ['en', 'zh']) {
      await prisma.solution.upsert({
        where: { locale_slug: { locale, slug: b.slug } },
        update: {},
        create: {
          locale,
          slug: b.slug,
          name: pickBi(b.name, locale),
          tagline: pickBi(b.tagline, locale),
          intro: pickBi(b.intro, locale),
          icon: typeof b.icon === 'string' ? b.icon : 'Boxes',
          heroImage: SLUG_IMAGES[b.slug] ?? null,
          capabilities: mapCaps(b.capabilities, locale),
          deliverables: b.deliverables.map((d) => pickBi(d, locale)),
          protocols: b.protocols,
          certifications: extras.certifications ?? [],
          workflow: mapSteps(extras.workflow ?? defaultWorkflow, locale),
          resources: mapResources(extras.resources ?? defaultResources, locale),
          sortOrder: order,
          status: PublishStatus.published,
          seoTitle: `${pickBi(b.name, locale)} — NFCTEC Solutions`,
          seoDescription: pickBi(b.tagline, locale),
        },
      });
    }
    order++;
  }
  console.log(`Imported ${baseIndustries.length} solutions (en+zh)`);

  const dlGroups = [
    { locale: 'en', name: 'SDKs', items: [
      { name: 'NFC Android SDK', version: 'v4.2.1', fileSize: '8.4 MB' },
      { name: 'NFC iOS SDK', version: 'v4.2.1', fileSize: '6.1 MB' },
    ]},
    { locale: 'en', name: 'Drivers', items: [
      { name: 'PC/SC CCID Driver — Windows', version: 'v3.1.4', fileSize: '4.2 MB' },
    ]},
  ];
  for (const g of dlGroups) {
    const group = await prisma.downloadGroup.create({
      data: { locale: g.locale, name: g.name, sortOrder: 0 },
    });
    let i = 0;
    for (const item of g.items) {
      await prisma.downloadItem.create({
        data: {
          groupId: group.id,
          name: item.name,
          version: item.version,
          fileSize: item.fileSize,
          sortOrder: i++,
          status: PublishStatus.published,
        },
      });
    }
  }
  console.log('Imported download groups');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
