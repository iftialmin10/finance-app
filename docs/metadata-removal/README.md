# Frontend-Only Tag/Profile/Currency Plan

This document describes how to remove all tag/profile/currency metadata from the backend database and shift those responsibilities entirely to the frontend (IndexedDB) while keeping the rest of the finance app functional. The work touches every layer of the stack and must be executed in deliberate phases to avoid breaking authenticated users.

---

## 1. Goals
- Eliminate `profileMetadata`, `tagMetadata`, `currencyMetadata`, and related JSON state from the `users` table.
- Make the frontend (guest and authenticated) the single source of truth for tag colors, default selections, and catalog lists.
- Populate the frontend database during setup by scanning historical transactions for distinct profiles/tags/currencies.
- Require every transaction (create/update/import) to include explicit profile, currency, and tag assignments; enforce in both UI and API.
- Allow the frontend to drop unused catalog entries during cleanup without affecting server data.

## 2. Non-Goals
- No attempt to keep rename/delete operations cheap on the server—uniqueness and reference checks may scan the entire transactions table.
- No server-side persistence of tag colors or default settings after this change.
- No changes to guest-mode logic beyond what is necessary to share code with the authenticated flow.
- No redesign of the transaction schema itself; rows still carry `profile`, `currency`, and `tags`.

## 3. Current Architecture Snapshot
| Concern | Current Source | Consumers |
|---------|----------------|-----------|
| Profiles list + active profile | `user.profileMetadata`, `user.appSettings` | `/app/api/profiles/*`, `ProfileContext` |
| Tags list + colors + rename/delete guards | `user.tagMetadata` | `/app/api/tags/*`, `TagContext`, tag modals |
| Currency catalog + default | `user.currencyMetadata`, `user.appSettings` | `/app/api/currencies/*`, `CurrencyContext` |
| Setup/import flows | Server endpoints that populate metadata from transactions | Setup page, contexts |

Every authenticated screen talks to these APIs, so simply deleting the metadata columns would make profile/tag/currency UIs empty.

## 4. Target Architecture
### 4.1 Data Ownership
- **Transactions (Postgres):** remain authoritative for historical facts and continue storing `profile`, `currency`, and `tags` per row.
- **Frontend Catalog (IndexedDB/React state):** becomes the only storage for catalog entries, defaults, colors, and per-user preferences (even when authenticated).
- **Backend APIs:** stop returning catalog metadata. They only validate incoming transactions (ensure non-empty profile/currency/tags, enforce allowed type enum) and expose bulk transaction queries needed by the setup wizard.

### 4.2 Setup Flow
1. User lands on setup (new or existing user after migration).
2. Client fetches all transactions (paged) via an existing or new API that supports streaming batches.
3. Client derives:
   - Distinct profile names (case-insensitive).
   - Distinct currencies (uppercased).
   - Tag name + profile + type tuples; assign random color during ingestion.
4. UI prompts:
   - Pick default currency (prefills with most frequent; if none, ask user to add one manually).
   - Pick active profile (prefill with most recent).
   - Confirm derived tags or add new ones.
5. Client stores the chosen defaults and catalogs in IndexedDB; backend stays oblivious.

### 4.3 Runtime Behavior
- `ProfileContext`, `TagContext`, and `CurrencyContext` operate in “guest mode” always (no API calls other than transaction fetch and submit).
- When creating/editing transactions, contexts supply catalog data from IndexedDB; backend still validates that each payload includes populated `profile`, `currency`, `tags`.
- Cleanup jobs (manual or automated) may delete catalog entries with zero matching transactions; this is acceptable per requirements.

### 4.4 Backend Contract Adjustments
- `/app/api/transactions/*` becomes the only surface area dealing with catalog fields.
- Validation middleware ensures `profile`, `currency`, and `tags` are non-empty strings (and `tags` array contains at least one item).
- Provide a new `/app/api/setup/transactions-summary` endpoint (or reuse `/transactions`) that streams paged rows so the client can build catalogs during setup.
- Deprecate and delete `/api/profiles*`, `/api/tags*`, and `/api/currencies*` routes after the frontend no longer calls them.

## 5. Workstreams
1. **Discovery & Readiness**
   - Audit existing API consumers to understand reliance on server metadata.
   - Instrument analytics/logging to ensure transaction payloads always include profile/currency/tags before cutting over.
2. **Backend Hardening**
   - Update transaction create/update endpoints to reject missing catalog fields (even before metadata removal).
   - Add helper queries to page through transactions efficiently (indexed by user, profile, currency).
   - Provide a stats endpoint returning frequency counts for setup suggestions (optional but reduces client work).
3. **Setup Wizard Rewrite**
   - Extend `app/setup/page.tsx` to fetch transactions, derive catalogs, and let the user confirm defaults.
   - Persist all derived catalogs in IndexedDB via existing utilities.
4. **Contexts & Hooks Refactor**
   - Simplify `ProfileContext`, `TagContext`, `CurrencyContext` to always use IndexedDB helpers (remove `useApi` branches).
   - Ensure contexts can rebuild state by rescanning transactions on-demand (e.g., when user clicks “Re-sync from transactions”).
   - Generate random colors when tags are first detected or manually created.
5. **API & Prisma Cleanup**
   - Delete `/api/profiles*`, `/api/tags*`, `/api/currencies*`, and associated lib helpers (`user-metadata`, `parse*` functions).
   - Remove metadata columns from Prisma schema and generate a migration that drops:
     - `profileMetadata`, `currencyMetadata`, `tagMetadata`, `appSettings` (or retain only non-catalog portions if still needed).
   - Update tests and seed data to match the new contract.
6. **Client-Side Validation**
   - Guard transaction forms so users cannot submit without selecting profile/currency/tag(s).
   - When contexts lack data (fresh user with no transactions), prompt the user to create catalog entries inline before they can save a transaction.
7. **Data Migration & Rollout**
   - One-time script (client-side or admin tool) that exports existing metadata for users so they can rebuild catalogs if needed.
   - Communication plan for users explaining that unused catalogs may disappear if no transactions reference them.
8. **Testing & E2E Updates**
   - Update Cypress flows (phase2/phase3 suites) to rely on the new setup behavior and IndexedDB catalog management.
   - Add regression tests ensuring transaction API rejects missing catalog fields.

## 6. Phase Breakdown
-### Phase 0 – Preparation
- Ship backend validation tightening.
- Add telemetry to measure how often transactions arrive without complete catalogs (should be zero before proceeding).

### Phase 1 – Parallel Frontend Catalog
- Make contexts ignore server metadata and build their state exclusively from IndexedDB while old APIs remain available for rollback.

### Phase 2 – Setup Experience (Completed)
- Added `/api/setup/catalog` to stream a per-user transaction summary (profiles, currencies, tags with frequencies).
- The setup screen now lets authenticated users scan existing transactions, preview the derived catalog, and apply it directly to IndexedDB (profiles/currencies/tags/defaults).
- Users can re-run the scan at any time to regenerate catalogs when new transactions introduce unseen entities.

### Phase 3 – Remove Server Metadata Usage (Completed)
- Profile/Tag/Currency contexts now run entirely off IndexedDB plus `/api/transactions` scans; all references to `/api/profiles|tags|currencies` were removed.
- Deleted every metadata-specific API route and the old `lib/user-metadata.ts` helpers; documentation and tests now reflect the front-end-only catalog workflow.
- Backups/restores continue to operate on transactions only, with catalog rebuild handled client-side after a restore.

### Phase 4 – Database & Schema Cleanup
- Drop unused columns and migrations.
- Remove `lib/user-metadata.ts` and any JSON helpers.
- Update Prisma client and regenerate types.

### Phase 5 – Final Rollout
- Enable the new behavior in staging, run full regression suite, then deploy to production.
- Monitor error logs for transaction validation failures or setup crashes.

## 8. Deployment & Migration Checklist
1. Deploy backend validation changes.
2. Release frontend contexts gated by feature flag.
3. Roll out setup wizard changes; allow selected beta users to rebuild catalogs.
4. Launch metadata-free mode (flip flag) once telemetry shows safe adoption.
5. Drop columns via Prisma migration and redeploy backend.
6. Remove legacy backup/import codepaths referencing metadata.

## 9. Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| IndexedDB wipes remove catalogs with no matching transactions | Educate users via release notes; encourage creating at least one transaction to preserve catalog entries they care about. |

## 10. Open Questions
1. Should we store hash-based colors to keep them stable across devices instead of purely random values?
4. Do we still need `appSettings` for non-catalog preferences (theme, etc.)? If yes, split it into a new column before dropping the old JSON blob.
- The answer is no. Drop app settings.
