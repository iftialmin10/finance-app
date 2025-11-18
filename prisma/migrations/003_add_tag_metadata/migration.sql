ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "tagMetadata" JSONB DEFAULT '[]'::jsonb;


