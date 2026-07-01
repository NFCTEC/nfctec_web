-- AlterTable: extend products, drop link_path
ALTER TABLE "products" DROP COLUMN IF EXISTS "link_path";

ALTER TABLE "products" ADD COLUMN "tagline" TEXT;
ALTER TABLE "products" ADD COLUMN "intro" TEXT;
ALTER TABLE "products" ADD COLUMN "icon" TEXT NOT NULL DEFAULT 'Boxes';
ALTER TABLE "products" ADD COLUMN "hero_image" TEXT;
ALTER TABLE "products" ADD COLUMN "images" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "products" ADD COLUMN "features" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "products" ADD COLUMN "specs" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "products" ADD COLUMN "use_cases" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "products" ADD COLUMN "highlights" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "products" ADD COLUMN "body" TEXT NOT NULL DEFAULT '';
ALTER TABLE "products" ADD COLUMN "has_detail_page" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN "cta_url" TEXT;
ALTER TABLE "products" ADD COLUMN "cta_label" TEXT;
ALTER TABLE "products" ADD COLUMN "secondary_cta_url" TEXT;
ALTER TABLE "products" ADD COLUMN "secondary_cta_label" TEXT;
ALTER TABLE "products" ADD COLUMN "og_image" TEXT;
