-- AlterTable
ALTER TABLE "posts" ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "post_views" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "viewer_key" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_views_post_id_viewer_key_viewed_at_idx" ON "post_views"("post_id", "viewer_key", "viewed_at");

-- AddForeignKey
ALTER TABLE "post_views" ADD CONSTRAINT "post_views_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
