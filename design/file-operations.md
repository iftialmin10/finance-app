[← Back to README](README.md)

# Data Persistence (PostgreSQL on Neon)

## Overview
All application data is stored in PostgreSQL (managed on Neon). Replace prior file/Google Drive concepts with normalized tables and transactional CRUD operations. No profile photo storage.

## Core Tables (App Domain)
- `profiles` — user-defined logical profiles
  - `id` UUID primary key
  - `user_id` UUID references `users(id)` on delete cascade
  - `name` text not null
  - `created_at` timestamptz default now()
  - `updated_at` timestamptz default now()
- `transactions`
  - `id` UUID primary key
  - `profile_id` UUID references `profiles(id)` on delete cascade
  - `occurred_at` date not null
  - `amount_minor` bigint not null  // store minor units to avoid float
  - `currency` text not null
  - `type` text check (type in ('expense','income')) not null
  - `note` text null
  - `created_at` timestamptz default now()
  - `updated_at` timestamptz default now()
- `tags`
  - `id` UUID primary key
  - `profile_id` UUID references `profiles(id)` on delete cascade
  - `name` text not null
  - unique (`profile_id`, `name`)
- `transaction_tags`
  - `transaction_id` UUID references `transactions(id)` on delete cascade
  - `tag_id` UUID references `tags(id)` on delete cascade
  - primary key (`transaction_id`, `tag_id`)
- `currencies`
  - `id` UUID primary key
  - `profile_id` UUID references `profiles(id)` on delete cascade
  - `code` text not null  // e.g., 'USD'
  - `is_base` boolean not null default false
  - unique (`profile_id`, `code`)

## Example Operations (Prisma)

### Create Profile
```typescript
import { prisma } from '../server/prisma';

async function createProfile(userId: string, name: string) {
  return prisma.profile.create({
    data: { userId, name },
    select: { id: true, userId: true, name: true, createdAt: true, updatedAt: true },
  });
}
```

### Insert Transaction
```typescript
import { prisma } from '../server/prisma';

async function addTransaction(profileId: string, input: {
  occurredAt: string; // YYYY-MM-DD
  amountMinor: number;
  currency: string;
  type: 'expense' | 'income';
  note?: string;
}) {
  return prisma.transaction.create({
    data: {
      profileId,
      occurredAt: new Date(input.occurredAt),
      amountMinor: BigInt(input.amountMinor),
      currency: input.currency,
      type: input.type,
      note: input.note ?? null,
    },
  });
}
```

### Query Transactions (Paged)
```typescript
import { prisma } from '../server/prisma';

async function listTransactions(profileId: string, limit = 50, offset = 0) {
  return prisma.transaction.findMany({
    where: { profileId },
    orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    skip: offset,
  });
}
```

### Tag Management
```typescript
import { prisma } from '../server/prisma';

async function ensureTag(profileId: string, name: string) {
  const tag = await prisma.tag.upsert({
    where: { profileId_name: { profileId, name } },
    create: { profileId, name },
    update: {},
    select: { id: true },
  });
  return tag.id;
}
```

## Backups and Restore
- Full database backups are exported from PostgreSQL to CSV files and bundled into a single `.zip` file that the user downloads.
- Restores are performed by the user uploading a previously downloaded `.zip` file; the server validates and restores the database contents from the CSVs.
- This mechanism is provider-agnostic and portable; it does not rely on cloud vendor point-in-time restore.

### Backup Contents (Zip Layout)

```
backup-YYYYMMDDTHHmmssZ.zip
├── manifest.json              # human-readable metadata about the backup
├── schema.md                  # human-readable description of tables/columns (optional)
└── tables/
    ├── users.csv
    ├── profiles.csv
    ├── transactions.csv
    ├── tags.csv
    ├── transaction_tags.csv
    └── currencies.csv
```

#### manifest.json (example)
```json
{
  "app": "finance-app",
  "version": "1.0.0",
  "createdAt": "2025-01-01T12:00:00Z",
  "database": {
    "engine": "postgresql",
    "encoding": "UTF-8",
    "timezone": "UTC"
  },
  "tables": [
    { "name": "users", "rowCount": 10, "csv": "tables/users.csv" },
    { "name": "profiles", "rowCount": 12, "csv": "tables/profiles.csv" },
    { "name": "transactions", "rowCount": 12345, "csv": "tables/transactions.csv" },
    { "name": "tags", "rowCount": 58, "csv": "tables/tags.csv" },
    { "name": "transaction_tags", "rowCount": 884, "csv": "tables/transaction_tags.csv" },
    { "name": "currencies", "rowCount": 240, "csv": "tables/currencies.csv" }
  ]
}
```

### CSV Format
- UTF-8 encoded with a single header row
- Comma delimiter, double-quote as quote char
- Escape quotes by doubling (`""`)
- Newlines preserved within quoted fields
- `NULL` values represented as empty fields
- Date/time values in ISO-8601 (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`)
- UUIDs as canonical lowercase strings
- Monetary amounts use integer minor units (PostgreSQL `bigint`)

### Backup Creation Flow
- Endpoint streams a `.zip` containing all required CSVs and the `manifest.json`.
- Table extraction order is chosen to simplify future restores (parents first, then children).
- Long-running exports surface progress via the global progress bar on the client.

### Restore Flow
- User uploads a `.zip` created by this application.
- Server validates:
  - Archive structure (`manifest.json` + `tables/` CSVs)
  - Supported app version (or compatible migration strategy)
  - CSV headers match expected schema (name and order)
  - Basic integrity checks (e.g., row counts match manifest)
- Server performs a transactional restore:
  - Ensures a maintenance/lock mode for the duration of restore
  - Truncates or re-creates tables in a safe dependency order
  - Loads CSVs using prepared statements/copy where possible
  - Re-enables constraints and verifies FK integrity at the end
- On success, the app clears relevant caches and reloads data.

### Security & Safeguards
- Admin-only access for both backup and restore endpoints
- Double confirmation for restore operations
- Strict file size/type limits and content validation
- Full server-side validation and transactional guarantees
- Detailed audit logging (who initiated, when, result)

## Security & Integrity
- Use transactions for multi-step writes (e.g., create transaction + tags).
- Enforce ownership checks at the service layer for every query.
- Validate and sanitize inputs; use parameterized queries or a safe ORM.

