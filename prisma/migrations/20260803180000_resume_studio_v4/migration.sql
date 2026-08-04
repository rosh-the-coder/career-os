-- Resume Studio V4 composition + critic fields
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "themeId" TEXT;
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "compositionJson" TEXT;
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "critiqueJson" TEXT;
