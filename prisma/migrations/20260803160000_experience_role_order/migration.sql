-- Resume Engine V3.2 — experience ordering + role preference fields
ALTER TABLE "Experience" ADD COLUMN IF NOT EXISTS "chronologyIndex" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Experience" ADD COLUMN IF NOT EXISTS "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Experience" ADD COLUMN IF NOT EXISTS "preferredOrderByRoleJson" TEXT NOT NULL DEFAULT '{}';
