-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'review', 'approved', 'published');

-- CreateEnum
CREATE TYPE "CategoryRoot" AS ENUM ('investment', 'ai', 'culture', 'humanities');

-- CreateEnum
CREATE TYPE "CategoryLeaf" AS ENUM ('stock', 'economy', 'news', 'tools', 'research', 'ethics', 'books', 'film', 'travel', 'lifestyle', 'philosophy', 'history', 'psychology', 'essay');

-- CreateEnum
CREATE TYPE "AuthorType" AS ENUM ('ai_draft', 'human_edited');

-- CreateEnum
CREATE TYPE "RevisionSourceType" AS ENUM ('ai_draft', 'human_edit', 'approval_snapshot', 'publish_snapshot');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('editor', 'admin');

-- CreateEnum
CREATE TYPE "MediaStorageProvider" AS ENUM ('s3');

-- CreateEnum
CREATE TYPE "PublishEventType" AS ENUM ('created', 'submitted_for_review', 'approved', 'published', 'unpublished');

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "category_root" "CategoryRoot" NOT NULL,
    "category_leaf" "CategoryLeaf" NOT NULL,
    "status" "PostStatus" NOT NULL,
    "author_type" "AuthorType" NOT NULL,
    "thumbnail_asset_id" UUID,
    "reading_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "current_revision_id" UUID,
    "published_revision_id" UUID,
    "created_by" UUID,
    "updated_by" UUID,
    "approved_by" UUID,
    "published_at" TIMESTAMPTZ(6),
    "approved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_revisions" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "markdown_body" TEXT NOT NULL,
    "frontmatter" JSONB NOT NULL DEFAULT '{}',
    "revision_note" TEXT,
    "source_type" "RevisionSourceType" NOT NULL,
    "source_model" TEXT,
    "editor_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "storage_provider" "MediaStorageProvider" NOT NULL DEFAULT 's3',
    "bucket_name" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "public_url" TEXT,
    "mime_type" TEXT NOT NULL,
    "file_size_bytes" BIGINT,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" TEXT,
    "uploaded_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tags" (
    "post_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("post_id","tag_id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "role" "AdminRole" NOT NULL DEFAULT 'editor',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMPTZ(6),

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publish_events" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "revision_id" UUID,
    "event_type" "PublishEventType" NOT NULL,
    "actor_id" UUID,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publish_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "posts_thumbnail_asset_id_key" ON "posts"("thumbnail_asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_current_revision_id_key" ON "posts"("current_revision_id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_published_revision_id_key" ON "posts"("published_revision_id");

-- CreateIndex
CREATE INDEX "posts_status_updated_at_idx" ON "posts"("status", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "posts_category_root_category_leaf_published_at_idx" ON "posts"("category_root", "category_leaf", "published_at" DESC);

-- CreateIndex
CREATE INDEX "post_revisions_post_id_created_at_idx" ON "post_revisions"("post_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_object_key_key" ON "media_assets"("object_key");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_slug_idx" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "publish_events_post_id_created_at_idx" ON "publish_events"("post_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_current_revision_id_fkey" FOREIGN KEY ("current_revision_id") REFERENCES "post_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_published_revision_id_fkey" FOREIGN KEY ("published_revision_id") REFERENCES "post_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_thumbnail_asset_id_fkey" FOREIGN KEY ("thumbnail_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publish_events" ADD CONSTRAINT "publish_events_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publish_events" ADD CONSTRAINT "publish_events_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "post_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publish_events" ADD CONSTRAINT "publish_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
