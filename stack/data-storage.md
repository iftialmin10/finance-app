[← Back to README](README.md)

# Data Storage & Management

## Storage Overview

Application data is persisted in PostgreSQL (managed on Neon). Prisma is the standard ORM for all data access. App-specific tables and relationships are documented in `design/file-operations.md` and `design/data-models.md` (now SQL-focused).

## PostgreSQL (Neon) with Prisma

- Use Neon for managed Postgres with autoscaling and branching.
- Connect via `DATABASE_URL` (SSL required). Use Neon pooling or Prisma Accelerate for best performance.
- Use transactions for multi-step writes to maintain consistency.
- Prefer bigint minor units for currency amounts to avoid floating-point issues.

## Prisma Setup

### Install
```bash
npm i -D prisma
npm i @prisma/client
npx prisma init
```

### Configure datasource
Set `DATABASE_URL` in your `.env.local` (Neon connection string, with `sslmode=require`).

### Define schema
See `design/data-models.md` for the SQL schema and the equivalent Prisma models.

### Migrate & generate
```bash
npx prisma migrate dev -n init
npx prisma generate
# Optional GUI
npx prisma studio
```

## Date Management

### date-fns
- Date formatting and manipulation
- Timezone support
- Lightweight alternative to moment.js

## Currency & Number Formatting

### Intl.NumberFormat (Built-in JavaScript API)
- Currency formatting for different locales
- No additional library needed
- Example: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(123.45)`

<!-- App-specific currency conversion logic lives in design/currency-system.md -->

## File/Image Handling
- Not applicable. The app does not store profile pictures or arbitrary files.

## Backups

Backups are performed by exporting the entire PostgreSQL database to CSV files and packaging them into a single `.zip` that the user downloads. Restores are performed by uploading that `.zip`, which the server validates and then uses to transactionally restore all tables.

- Format and layout are defined in `design/file-operations.md` (manifest, CSV rules, table ordering)
- Endpoint contract is defined in `design/api-design.md` (`GET /api/backup`, `POST /api/restore`)
- This approach is cloud-provider-agnostic and portable

