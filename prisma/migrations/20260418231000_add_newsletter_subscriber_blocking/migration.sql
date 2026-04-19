ALTER TABLE "newsletter_subscribers"
ADD COLUMN "blocked_at" TIMESTAMPTZ(6),
ADD COLUMN "blocked_reason" TEXT;

CREATE INDEX "newsletter_subscribers_blocked_at_idx"
ON "newsletter_subscribers"("blocked_at");
