[← Back to README](README.md)

# API Routes Design

## Authentication APIs
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login with email/password (sets HTTP-only cookie)
- `POST /api/auth/logout` — Logout and invalidate session
- `GET /api/auth/session` — Get current session/user

## Storage
Backed by PostgreSQL (Neon). All endpoints below operate on database tables with server-side authorization checks.

## Data Management APIs
- `GET /api/transactions?profileId&from&to&type` — List transactions (paged)
- `POST /api/transactions` — Create transaction
- `PUT /api/transactions/:id` — Update transaction
- `DELETE /api/transactions/:id` — Delete transaction
- `GET /api/tags?profileId` — List tags
- `POST /api/tags` — Create or upsert tag
- `DELETE /api/tags/:id` — Delete tag
- `GET /api/currencies?profileId` — List currencies for profile
- `POST /api/currencies` — Add currency or mark base
- `PUT /api/currencies/:id` — Update currency properties
- `DELETE /api/currencies/:id` — Remove currency
- `GET /api/statistics?profileId&from&to&displayCurrency` — Aggregated metrics
- `GET /api/settings` — Get user/app settings
- `POST /api/settings` — Update user/app settings

## Profile Management APIs
- `GET /api/profiles` - Get all profiles
- `POST /api/profiles` - Create new profile
- `PUT /api/profiles/:profileId` - Update profile (rename)
- `DELETE /api/profiles/:profileId` - Delete profile
- `POST /api/profiles/:profileId/activate` - Set active profile (per user)

## Backup APIs
- `GET /api/backup` — Streams a single `.zip` containing CSVs for all tables and a `manifest.json`.
  - Auth: Admin-only
  - Response: `application/zip`, filename `backup-YYYYMMDDTHHmmssZ.zip`
- `POST /api/restore` — Accepts a `.zip` produced by `GET /api/backup` and restores the entire database.
  - Auth: Admin-only
  - Request: `multipart/form-data` (field `file`) or `application/zip` body
  - Headers: `X-Restore-Confirm: finance-app` (double confirmation)
  - Behavior: Full transactional restore with schema/header validation and integrity checks

# State Management

## Context Providers

### AuthContext
- User session state
- Sign in/out functions
- Loading states

### AppContext
- Global app settings
- Profiles list and active profile
- Tags data (for active profile)
- Currencies data (for active profile)
- Default currency, date format preferences
- Profile switching functionality

### LoadingContext
- Global loading state for API calls
- Request counter to track concurrent external requests
- Functions to increment/decrement loading state
- Used by GlobalProgressBar component to show/hide progress indicator

**Implementation Note:** API route handlers should toggle the `LoadingContext` to automatically show/hide the global progress bar.

## Local State
- Form inputs (controlled components)
- UI states (modals, drawers, dialogs)
- Loading and error states for async operations (local spinners, not global progress bar)

