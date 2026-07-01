/**
 * Seed product catalog from legacy i18n content + NFC Field Detector detail page.
 * Run from api/: node scripts/seed-products.mjs
 */
import { PrismaClient, PublishStatus } from '@prisma/client';

const prisma = new PrismaClient();

const AMAZON_URL = 'https://www.amazon.com/NFC-Field-Status-Card-Professional/dp/B0FSRYJP7J';

const catalog = [
  { slug: 'epassport-reader', category: 'software', icon: 'Code2', sortOrder: 0, en: { name: 'ePassport Reader Software', description: 'ICAO 9303 compliant — BAC/PACE/EAC, MRZ OCR, DG1–DG16 parsing & PA verification.' }, zh: { name: '电子护照阅读软件', description: '符合 ICAO 9303 — BAC/PACE/EAC、MRZ 识别、DG1–DG16 解析与 PA 验证。' } },
  { slug: 'emv-sdk', category: 'software', icon: 'CreditCard', sortOrder: 1, en: { name: 'Bank Card (EMV) Reading SDK', description: 'Read PAN, expiry, track data and cardholder info from contactless EMV cards.' }, zh: { name: '银行卡 (EMV) 读卡 SDK', description: '从非接 EMV 银行卡读取 PAN、有效期、磁道数据与持卡人信息。' } },
  { slug: 'ntag-issuance', category: 'software', icon: 'Layers', sortOrder: 2, en: { name: 'NTAG / DESFire / MIFARE Issuance', description: 'Personalize NTAG 424 DNA, DESFire EV2/EV3, MIFARE Classic & Ultralight in bulk.' }, zh: { name: 'NTAG / DESFire / MIFARE 发卡', description: '批量个人化 NTAG 424 DNA、DESFire EV2/EV3、MIFARE Classic 与 Ultralight。' } },
  { slug: 'issuance-api', category: 'software', icon: 'Smartphone', sortOrder: 3, en: { name: 'Issuance API', description: 'POST a card UID → we return personalization data. No keys leave our HSM.' }, zh: { name: '发卡 API', description: 'POST 卡片 UID → 返回个人化数据。密钥全程托管于 HSM。' } },
  { slug: 'verification-api', category: 'software', icon: 'Key', sortOrder: 4, en: { name: 'Verification API', description: 'Verify SUN URLs, CMAC, MAC counters — one REST call, JSON result.' }, zh: { name: '验证 API', description: '校验 SUN URL、CMAC、计数器 — 一个 REST 接口，返回 JSON。' } },
  { slug: 'issuance-platform', category: 'software', icon: 'Server', sortOrder: 5, en: { name: 'Issuance Platform (SaaS)', description: 'Web console for tag projects, key profiles, batch jobs and audit logs.' }, zh: { name: '发卡平台 (SaaS)', description: 'Web 控制台管理标签项目、密钥配置、批量任务与审计日志。' } },
  { slug: 'mobile-wallet-sdk', category: 'software', icon: 'Wallet', sortOrder: 6, en: { name: 'Mobile Wallet SDK', description: 'HCE card emulation, Secure Element applets, tokenization, Apple Pay / Google Pay integration.' }, zh: { name: '手机钱包 SDK', description: 'HCE 卡模拟、安全元件小程序、令牌化、Apple Pay / Google Pay 集成。' } },
  { slug: 'usb-readers', category: 'hardware', icon: 'Usb', sortOrder: 0, en: { name: 'USB NFC Readers', description: 'Plug-and-play USB CCID / PC/SC readers — ISO 14443 A/B, 13.56 MHz.' }, zh: { name: 'USB NFC 读卡器', description: '即插即用 USB CCID / PC/SC 读卡器,支持 ISO 14443 A/B,13.56 MHz。' } },
  { slug: 'serial-readers', category: 'hardware', icon: 'Cpu', sortOrder: 1, en: { name: 'Serial (UART) Readers', description: 'RS-232 / TTL serial NFC readers for industrial PCs, kiosks and embedded hosts.' }, zh: { name: '串口 (UART) 读卡器', description: 'RS-232 / TTL 串口 NFC 读卡器,适配工控机、自助设备与嵌入式主机。' } },
  { slug: 'embedded-modules', category: 'hardware', icon: 'Tablet', sortOrder: 2, en: { name: 'Embedded NFC Modules', description: 'PN532 / PN5180 modules over UART / SPI / I²C — integrate into your product.' }, zh: { name: '嵌入式 NFC 模组', description: 'PN532 / PN5180 模组,UART/SPI/I²C 接口,便于集成到您的产品。' } },
  { slug: 'blank-cards', category: 'hardware', icon: 'Boxes', sortOrder: 4, en: { name: 'Blank NFC Cards & Tags', description: 'NTAG 424 DNA, DESFire EV2/EV3, NTAG213/215/216 — ready for issuance.' }, zh: { name: '空白 NFC 卡与标签', description: 'NTAG 424 DNA、DESFire EV2/EV3、NTAG213/215/216,即开即发。' } },
  { slug: 'antennas-inlays', category: 'hardware', icon: 'Radio', sortOrder: 5, en: { name: 'Antennas & Custom Inlays', description: '13.56 MHz antennas and inlays tuned for metal, liquid and custom form factors.' }, zh: { name: '天线与定制封装', description: '13.56 MHz 天线与封装,针对金属、液体与异形需求调优。' } },
];

function nfcFieldDetector(locale) {
  const en = locale === 'en';
  return {
    slug: 'nfc-field-detector',
    category: 'hardware',
    icon: 'Terminal',
    sortOrder: 3,
    hasDetailPage: true,
    name: en ? 'NFC Signal Detection Card' : 'NFC 信号检测卡',
    description: en
      ? 'Pocket card with LED — visually verify reader RF field strength on-site.'
      : '口袋大小带 LED 检测卡,现场直观检测读卡器射频信号强度。',
    tagline: en
      ? '15-LED RF field tester · 13.56 MHz · ISO card · battery-free'
      : '15 颗 LED 射频场检测卡 · 13.56 MHz · ISO 标准卡片 · 无需电池',
    intro: en
      ? 'A pocket-size diagnostic card that lights up its 15 LEDs whenever it enters an active 13.56 MHz NFC field. Slip it across a reader, gate, kiosk or POS terminal and instantly see whether RF is present — and how strong it is — without any host, app, battery or chip.'
      : '口袋大小的诊断工具卡,只要进入 13.56 MHz 有效 NFC 射频场,15 颗 LED 就会亮起。在读卡器、闸机、自助机或 POS 终端上一刷,无需电脑、无需 App、无需电池、无需芯片,就能直观看到是否有射频以及场强大小。',
    images: [
      { src: 'https://m.media-amazon.com/images/I/61ekYw88WyL._AC_SX679_.jpg', label: en ? 'Front' : '正面' },
      { src: 'https://m.media-amazon.com/images/I/418FHh99LQL._AC_SX679_.jpg', label: en ? 'Back' : '背面' },
    ],
    highlights: en
      ? [
          '15 bright LEDs — visualize field presence and strength',
          'No battery, no charging, no maintenance',
          'ISO 7810 ID-1 card size — fits any wallet or toolkit',
          'Non-data card — won\'t interfere with reader logs',
        ]
      : [
          '15 颗高亮 LED —— 直观显示场存在与强度',
          '无电池、无需充电、免维护',
          'ISO 7810 ID-1 卡片尺寸 —— 任意钱包或工具包均可携带',
          '无数据卡 —— 不会污染读卡器日志',
        ],
    features: en
      ? [
          { icon: 'Zap', title: '15 LED Indicator Array', description: 'Bright red LEDs light up the moment the card enters an active 13.56 MHz field — the more LEDs lit, the stronger the field.' },
          { icon: 'BatteryCharging', title: 'No Battery Required', description: 'Fully powered by the reader\'s RF field — no charging, no battery replacement, no maintenance.' },
          { icon: 'CreditCard', title: 'ISO Card Form Factor', description: 'Standard 85.6 × 54 mm PVC card — fits any wallet, badge holder or toolkit.' },
          { icon: 'Radio', title: 'Non-Data, Pure RF Test', description: 'No chip memory, no UID — only field detection. Perfect for testing readers without polluting logs.' },
          { icon: 'Wrench', title: 'Built for Field Engineers', description: 'Diagnose dead readers, locate antenna sweet spots, validate kiosk and POS installs.' },
          { icon: 'CheckCircle2', title: 'Quality-Assured', description: '100% functional test per card before shipment.' },
        ]
      : [
          { icon: 'Zap', title: '15 颗 LED 指示阵列', description: '进入 13.56 MHz 有效射频场即点亮,亮起的 LED 越多,说明场强越强。' },
          { icon: 'BatteryCharging', title: '无需电池', description: '完全由读卡器射频场供电,无需充电、无需更换电池、免维护。' },
          { icon: 'CreditCard', title: '标准 ISO 卡片尺寸', description: '标准 85.6 × 54 mm PVC 卡片,钱包、工牌套、工具包都能放。' },
          { icon: 'Radio', title: '纯射频检测,无数据存储', description: '不存数据、无 UID、不参与协议交互,仅用于场检测。' },
          { icon: 'Wrench', title: '为现场工程师而生', description: '排查故障读卡器、寻找天线最佳位置、验证自助机与 POS 安装。' },
          { icon: 'CheckCircle2', title: '出厂品质保证', description: '每张卡片出厂前 100% 功能测试,批次间读数稳定一致。' },
        ],
    specs: en
      ? [
          { key: 'Operating Frequency', value: '13.56 MHz (HF / NFC)' },
          { key: 'Compatible Protocols', value: 'ISO 14443 A/B, ISO 15693, NFC Forum' },
          { key: 'Indicator', value: '15 × red LED array' },
          { key: 'Power', value: 'RF field harvested — no battery' },
          { key: 'Dimensions', value: '85.6 × 54 × 0.76 mm' },
          { key: 'Material', value: 'PVC, matte black' },
          { key: 'Weight', value: '~5 g' },
          { key: 'Data Storage', value: 'None — pure field detector' },
        ]
      : [
          { key: '工作频率', value: '13.56 MHz (HF / NFC)' },
          { key: '兼容协议', value: 'ISO 14443 A/B, ISO 15693, NFC Forum' },
          { key: '指示方式', value: '15 颗红色 LED 阵列' },
          { key: '供电方式', value: '射频场取电 —— 无需电池' },
          { key: '外形尺寸', value: '85.6 × 54 × 0.76 mm' },
          { key: '材质', value: 'PVC,哑光黑色' },
          { key: '重量', value: '~5 g' },
          { key: '数据存储', value: '无 —— 纯场检测器' },
        ],
    useCases: en
      ? [
          'Verify a reader is powered and radiating before further debug.',
          'Map the antenna sweet spot on POS terminals, kiosks and access readers.',
          'Compare RF field strength across gate lanes in transit stations.',
          'On-site installation acceptance for hotel, office and parking access systems.',
          'Quickly distinguish reader faults from card / tag faults in the field.',
          'Production line QA for reader assembly and RF tuning.',
        ]
      : [
          '在深入排查前,快速确认读卡器是否上电并正常辐射。',
          '标定 POS、自助机、门禁读卡器的天线最佳读取位置。',
          '对比地铁/公交闸机各通道之间的射频场强。',
          '酒店、办公、停车场门禁系统的现场安装验收。',
          '现场快速区分读卡器故障与卡片/标签故障。',
          '读卡器产线装配与射频调试的品质检验。',
        ],
    ctaUrl: AMAZON_URL,
    ctaLabel: en ? 'Buy on Amazon' : '亚马逊购买',
    secondaryCtaUrl: '/contact',
    secondaryCtaLabel: en ? 'Request a Quote' : '获取报价',
    seoTitle: en
      ? 'NFC Signal Detection Card — 15 LED Field Tester | NFCTEC'
      : 'NFC 信号检测卡 — 15 LED 场强检测 | NFCTEC',
    seoDescription: en
      ? 'Pocket-size NFC field status card with 15 LED indicators. Visually verify reader RF field strength on-site.'
      : '口袋大小 NFC 场强检测卡,15 颗 LED 指示,现场直观验证读卡器射频场。',
    ogImage: 'https://m.media-amazon.com/images/I/61ekYw88WyL._AC_SX679_.jpg',
  };
}

async function upsertProduct(locale, data) {
  await prisma.product.upsert({
    where: { locale_slug: { locale, slug: data.slug } },
    create: {
      locale,
      slug: data.slug,
      name: data.name,
      description: data.description,
      category: data.category,
      icon: data.icon ?? 'Boxes',
      tagline: data.tagline ?? null,
      intro: data.intro ?? null,
      images: data.images ?? [],
      features: data.features ?? [],
      specs: data.specs ?? [],
      useCases: data.useCases ?? [],
      highlights: data.highlights ?? [],
      body: data.body ?? '',
      hasDetailPage: data.hasDetailPage ?? false,
      ctaUrl: data.ctaUrl ?? null,
      ctaLabel: data.ctaLabel ?? null,
      secondaryCtaUrl: data.secondaryCtaUrl ?? null,
      secondaryCtaLabel: data.secondaryCtaLabel ?? null,
      sortOrder: data.sortOrder ?? 0,
      status: PublishStatus.published,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      ogImage: data.ogImage ?? null,
    },
    update: {
      name: data.name,
      description: data.description,
      category: data.category,
      icon: data.icon ?? 'Boxes',
      tagline: data.tagline ?? null,
      intro: data.intro ?? null,
      images: data.images ?? [],
      features: data.features ?? [],
      specs: data.specs ?? [],
      useCases: data.useCases ?? [],
      highlights: data.highlights ?? [],
      body: data.body ?? '',
      hasDetailPage: data.hasDetailPage ?? false,
      ctaUrl: data.ctaUrl ?? null,
      ctaLabel: data.ctaLabel ?? null,
      secondaryCtaUrl: data.secondaryCtaUrl ?? null,
      secondaryCtaLabel: data.secondaryCtaLabel ?? null,
      sortOrder: data.sortOrder ?? 0,
      status: PublishStatus.published,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      ogImage: data.ogImage ?? null,
    },
  });
}

async function main() {
  for (const locale of ['en', 'zh']) {
    for (const item of catalog) {
      const loc = item[locale];
      await upsertProduct(locale, {
        slug: item.slug,
        category: item.category,
        icon: item.icon,
        sortOrder: item.sortOrder,
        name: loc.name,
        description: loc.description,
      });
    }
    await upsertProduct(locale, nfcFieldDetector(locale));
    console.log(`Seeded products for ${locale}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
