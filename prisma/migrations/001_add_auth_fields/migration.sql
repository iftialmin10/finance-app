ALTER TABLE "users"
ADD COLUMN "verificationToken" TEXT,
ADD COLUMN "verificationTokenExpiresAt" TIMESTAMPTZ,
ADD COLUMN "resetPasswordToken" TEXT,
ADD COLUMN "resetPasswordTokenExpiresAt" TIMESTAMPTZ,
ADD COLUMN "sessionToken" TEXT;

CREATE INDEX IF NOT EXISTS users_session_token_idx ON "users" ("sessionToken");

