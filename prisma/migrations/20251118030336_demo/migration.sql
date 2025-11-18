/*
  Warnings:

  - The primary key for the `transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- DropIndex
DROP INDEX "users_session_token_idx";

-- AlterTable
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "occurredAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "tags" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "emailVerifiedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "verificationTokenExpiresAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "resetPasswordTokenExpiresAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "profileMetadata" DROP DEFAULT,
ALTER COLUMN "currencyMetadata" DROP DEFAULT,
ALTER COLUMN "appSettings" DROP DEFAULT,
ALTER COLUMN "tagMetadata" DROP DEFAULT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "transactions_user_profile_date_idx" RENAME TO "transactions_userId_profile_occurredAt_idx";

-- RenameIndex
ALTER INDEX "transactions_user_type_idx" RENAME TO "transactions_userId_type_idx";
