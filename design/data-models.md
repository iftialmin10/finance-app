[← Back to README](README.md)

# Data Models (PostgreSQL)

## SQL Schema (Core)

### users
```sql
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  email_verified_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### profiles
```sql
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### transactions
```sql
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  occurred_at date not null,
  amount_minor bigint not null,
  currency text not null,
  type text not null check (type in ('expense','income')),
  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### tags
```sql
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  constraint uq_tag unique (profile_id, name)
);
```

### transaction_tags
```sql
create table if not exists transaction_tags (
  transaction_id uuid not null references transactions(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (transaction_id, tag_id)
);
```

### currencies
```sql
create table if not exists currencies (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  code text not null,
  is_base boolean not null default false,
  constraint uq_currency unique (profile_id, code)
);
```

## TypeScript Interfaces

```typescript
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  profileId: string;
  occurredAt: string; // YYYY-MM-DD
  amountMinor: number; // integer minor units
  currency: string;
  type: TransactionType;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  profileId: string;
  name: string;
}

export interface Currency {
  id: string;
  profileId: string;
  code: string;
  isBase: boolean;
}
```

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String    @id @default(uuid())
  email            String    @unique
  passwordHash     String
  emailVerifiedAt  DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @default(now())
  profiles         Profile[]

  @@map("users")
}

model Profile {
  id         String        @id @default(uuid())
  userId     String
  name       String
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @default(now())
  user       User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  tags       Tag[]
  currencies Currency[]

  @@map("profiles")
}

model Transaction {
  id          String   @id @default(uuid())
  profileId   String
  occurredAt  DateTime
  amountMinor BigInt
  currency    String
  type        TransactionType
  note        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @default(now())
  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  tags        TransactionTag[]

  @@map("transactions")
}

enum TransactionType {
  expense
  income
}

model Tag {
  id        String    @id @default(uuid())
  profileId String
  name      String
  profile   Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  trxs      TransactionTag[]

  @@unique([profileId, name], name: "profileId_name")
  @@map("tags")
}

model TransactionTag {
  transactionId String
  tagId         String
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  tag           Tag         @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([transactionId, tagId])
  @@map("transaction_tags")
}

model Currency {
  id        String  @id @default(uuid())
  profileId String
  code      String
  isBase    Boolean @default(false)
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@unique([profileId, code], name: "profileId_code")
  @@map("currencies")
}
```

