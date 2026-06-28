import { PrismaClient, Locale, PublishStatus, AdminRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@nfctec.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'changeme123';

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name: 'NFCTEC Admin',
      role: AdminRole.super_admin,
    },
  });

  const sampleBody = [
    {
      text: 'EMV contactless transactions have a hard timing budget. From the moment a card enters the field to the moment the terminal sends the first GENERATE AC command, everything must be done in under 500 ms.',
    },
    {
      heading: 'Step 1 — PPSE',
      text: "The terminal issues SELECT '2PAY.SYS.DDF01'. The card responds with an FCI template listing every supported application AID.",
    },
  ];

  await prisma.post.upsert({
    where: {
      locale_slug: { locale: Locale.en, slug: 'emv-contactless-aid-selection' },
    },
    update: {},
    create: {
      locale: Locale.en,
      slug: 'emv-contactless-aid-selection',
      title: 'How EMV Contactless Selects an AID in 6 ms',
      excerpt:
        'A byte-level walk-through of PPSE, AID lists and kernel selection across Visa, Mastercard and UPI.',
      body: sampleBody,
      category: 'EMV',
      readMinutes: 8,
      status: PublishStatus.published,
      publishedAt: new Date('2026-05-12'),
      seoTitle: 'How EMV Contactless Selects an AID in 6 ms — NFCTEC Blog',
    },
  });

  const orgSetting = await prisma.siteSetting.findFirst({
    where: { key: 'organization', locale: null },
  });
  if (!orgSetting) {
    await prisma.siteSetting.create({
      data: {
        key: 'organization',
        locale: null,
        value: {
          name: 'NFCTEC',
          url: 'https://www.nfctec.com',
          email: 'sale@nfctec.com',
        },
      },
    });
  }

  console.log(`Seed complete. Admin login: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
