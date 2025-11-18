ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "profileMetadata" JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS "currencyMetadata" JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS "appSettings" JSONB DEFAULT '{}'::jsonb;


