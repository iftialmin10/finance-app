-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionType') THEN
        CREATE TYPE "TransactionType" AS ENUM ('expense', 'income');
    END IF;
END$$;

-- Users
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "passwordSalt" TEXT,
    "emailVerifiedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "profile" TEXT NOT NULL,
    "occurredAt" TIMESTAMPTZ NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "tags" TEXT[] NOT NULL DEFAULT '{}',
    "note" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_user_profile_date_idx ON "transactions" ("userId", "profile", "occurredAt");
CREATE INDEX IF NOT EXISTS transactions_user_type_idx ON "transactions" ("userId", "type");

