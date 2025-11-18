# Postgres Rollout Plan

This plan keeps guest mode intact (it remains accessible via the in-app Guest Mode button) while introducing a Postgres-backed API powered by Prisma in incremental, UI-testable phases. Spin up the database anytime with `docker compose up -d postgres` from the project root and point `DATABASE_URL` to `postgres://finance_user:finance_pass@localhost:5432/finance_app`. All backend data access must go through `prisma/schema.prisma` and the generated Prisma Client.

**Quick Reference**
- `docker compose up -d postgres mailhog` runs the full dev stack (Postgres + MailHog).
- `.env.local` should set `EMAIL_PROVIDER=mailhog`, `MAILHOG_HOST=localhost`, `MAILHOG_PORT=1025`, `MAILHOG_HTTP_URL=http://localhost:8025`, plus Brevo creds for staging/prod.
- Seeded users (from `npm run prisma:seed`): `demo+verified@finance-app.dev / Password123!` (verified) and `demo+pending@finance-app.dev` (unverified, token `seed-pending-token`).
- Cypress command for any spec (auto server + reset + teardown):  
  `npm_config_spec=<spec> PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="Yes, run npx prisma migrate reset --force --skip-generate --skip-seed on the local dev database" npm run test:ui`
- MailHog inbox: http://localhost:8025 — tests clear it via `cy.task('mailhog:clear')` and read via `mailhog:getMessages`.

**Cypress UI Testing Charter**
- Cypress is the standard UI test harness for every phase. Add `npm run test:e2e` (Cypress component + e2e runner) and a `tests/reset-db.ts` helper that runs `npx prisma migrate reset --force && npm run prisma:seed`.
- Before every Cypress spec (via `beforeEach`), call a custom `/api/test/reset` route or invoke the helper directly to ensure the DB is dropped, migrated, and reseeded. This guarantees deterministic fixtures for each test step.
- Document the reset command next to each phase’s test plan so QA can reproduce the workflow locally and in CI.

**Automated Server/Test Lifecyle Policy**
1. For any Cypress UI test case, developers invoke a single command: `npm run test:ui -- --spec <path/to/spec.cy.ts>`.
2. The `test:ui` script must:
   - Start the Next.js server (and supporting services like Postgres) in the background using `start-server-and-test` or an equivalent wrapper.
   - Wait until the health check (`/api/health`) returns `ok: true`.
   - Call the DB reset helper to ensure deterministic state.
   - Launch Cypress (headed or headless depending on `CI` env) against the running server.
   - When Cypress exits (success or failure), automatically shut down the server and any background processes, returning the same exit code as Cypress.
3. CI pipelines use this policy verbatim, ensuring that each spec start-to-finish is self-contained: spin up ➜ reset/seed ➜ test ➜ tear down.

---

## Phase 0 – Storage & Feature Flag Baseline

**Goal:** Introduce the Postgres schema, migrations, and plumbing required to toggle between guest mode and the real API without impacting today’s UX.

**Steps**
1. Define the initial Prisma schema (`prisma/schema.prisma`) that mirrors the data models described in `design/ui/data-models.md`, focusing on just two tables: `users` (auth-only fields) and `transactions` (each row stores `profile`, `currency`, `tags`, `note`, timestamps). There is no separate metadata store—profiles/currencies/tags only exist as values embedded in transactions.
2. Add Prisma migration + seed scripts (`prisma/migrations`, `prisma/seed.ts`) that create an initial admin user plus demo transactions covering multiple profiles/currencies/tags for smoke testing (these rows become the source of truth for derived lists).
3. Extend app configuration (e.g., `.env.local`) with `DATABASE_URL`, `SESSION_SECRET`, and a `NEXT_PUBLIC_FORCE_GUEST_MODE` flag that lets developers simulate pressing the Guest Mode button automatically (useful for demos) while keeping the normal user flow unchanged.
4. Create shared backend utilities: DB client, hashing helpers, transactional wrapper, and standardized API response helpers.
5. Expose a health-check route (e.g., `GET /api/health`) that confirms Prisma can connect to Postgres; wire it into developer docs so QA can validate the stack quickly.
6. Bootstrap Cypress: add `cypress.config.ts`, seed-friendly fixtures, the DB reset helper/route, and a smoke spec (`phase0-health.cy.ts`) that (a) triggers the reset, (b) visits `/api/health`, and (c) verifies guest mode toggle still works.

**UI testing on completion:** Run `npm run test:e2e -- --spec phase0-health.cy.ts` (Cypress automatically resets + seeds before the test). The spec should confirm the health endpoint returns `ok: true`, guest mode toggle still works, and the seeded transactions exist after reset.

---

## Phase 1 – Auth & Session Routes

**Goal:** Power the entire auth flow (`/app/auth/*`) with Postgres while still allowing guest mode sessions.

**Steps**
1. Implement `/api/auth/signup-request`, `/api/auth/verify`, `/api/auth/set-password`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`, `/api/auth/forgot-password-request`, `/api/auth/reset-password-verify`, and `/api/auth/reset-password` using the `users` table (add whatever scalar columns you need for token hashes/expiry while keeping the schema limited to this table).
2. Add password hashing (bcrypt/argon2), session tokens (JWT or database-backed sessions), and enforce email verification gates exactly as described in `design/ui/api`, persisting everything through Prisma.
3. Provide dev-friendly email delivery by plugging the routes into Brevo sandbox or a mail catcher while keeping guest-mode stubs active when `NEXT_PUBLIC_FORCE_GUEST_MODE=true`.
4. Update the AuthContext to detect when Prisma-backed routes are available (feature flag + health check) and to respect the Guest Mode button state so requests are routed to guest data only when the user explicitly opts in.
5. Seed test accounts (verified + unverified) so UI testers can immediately run through the auth pages without manual setup (the seed script already runs before each Cypress test).
6. Add Cypress specs (`phase1-auth.cy.ts`) that cover signup → verify → login → logout → reset password, invoking the DB reset helper in `beforeEach`.
7. Ship self-service account deletion by exposing a `DELETE /api/account` route that removes the authenticated user (cascading transactions), clears the session cookie, mirrors the flow in guest mode, and surfaces a destructive “Delete Account” control in the dashboard UI with appropriate confirmation UX.

**UI testing on completion:** Execute `npm run test:e2e -- --spec phase1-auth.cy.ts`. Cypress should: reset + seed, walk through signup/verify/login/logout flows, confirm session persistence, and finally toggle Guest Mode to ensure the fallback still works.

---

## Phase 2 – Profiles, Currencies & User Settings

**Goal:** Back the Profiles (`/app/profiles`), Setup (`/app/setup`), and Currencies (`/app/currencies`) screens by deriving their state directly from the `transactions` table (distinct profile/currency values) and mutating those rows to keep the UI in sync.

**Steps**
1. Build `/api/profiles/rename`, `/api/profiles/rename/preview`, `/api/profiles/delete/preview`, `/api/profiles/import`, plus CRUD routes for creating/deleting profiles by issuing bulk updates/selects against the `transactions` table (e.g., `UPDATE transactions SET profile = $new WHERE userId = $user AND profile = $old`).
2. Implement `/api/currencies` endpoints (list, create, update, delete, set default) by reading distinct currencies from transactions and applying updates by rewriting the relevant rows (or inserting seed transactions when a brand-new currency is created).
3. Ensure preview endpoints leverage Postgres queries (`SELECT COUNT(*) FROM transactions WHERE profile = $X`) before destructive actions.
4. Introduce server-side validation for per-user profile names and currency codes prior to mutating transaction rows, and bubble errors through existing `Snackbar` patterns on the UI.
5. Update client hooks/contexts to call these Prisma-backed mutation endpoints when the user is in normal mode, while continuing to route requests to IndexedDB-backed guest logic whenever the Guest Mode button is active.
6. Create Cypress specs (`phase2-profiles.cy.ts`, `phase2-currencies.cy.ts`) that, for each scenario, call the DB reset helper, perform profile rename/delete/import actions, perform currency CRUD, and assert that the underlying transactions reflect the changes.

**UI testing on completion:** Run `npm run test:e2e -- --spec phase2-*.cy.ts`. Each spec should start by resetting/seeding the DB, exercise the relevant UI flows, and finish by confirming the transactions table (queried via Cypress task) matches expectations.

---

## Phase 3 – Tags & Transactions

**Goal:** Replace the guest-only flow for `/app/tags`, `/app/transactions`, and `/app/transactions/create` with Postgres-backed data sourced solely from the `transactions` table (each row already contains profile/currency/tag data), including statistics inputs.

**Steps**
1. Implement `/api/tags/rename`, `/api/tags/rename/preview`, `/api/tags/delete/preview`, `/api/tags` (DELETE + future POST) by updating the `tags` arrays stored on the relevant transactions (e.g., `UPDATE ... SET tags = array_replace(tags, $old, $new)`), ensuring consistency across all rows.
2. Create full CRUD for `/api/transactions` (list with filtering/sorting/pagination, create, update, delete, detail) using Prisma queries over the `transactions` table indexed by `userId`, `profile`, and `type`.
3. Mirror the guest-mode filtering logic (date range, profile, type, pagination) inside Prisma queries so UI expectations stay identical.
4. Add optimistic UI updates plus background revalidation so the experience matches the current mock behavior.
5. Write integration tests (Playwright or Vitest API tests) to ensure pagination, validation errors, and permission boundaries are correct.
6. Expand the Cypress suite with `phase3-tags.cy.ts` and `phase3-transactions.cy.ts`, each invoking the reset helper in `beforeEach`, then validating tag rename/delete previews, transaction CRUD, and statistics widgets.

**UI testing on completion:** Execute `npm run test:e2e -- --spec phase3-*.cy.ts` after each feature. Cypress will reset/seed before every spec, ensuring deterministic tag + transaction data.

---

## Phase 4 – Backup/Restore & Statistics

**Goal:** Deliver the remaining `/app/backup-restore` and `/app/statistics` flows using Postgres so all routes are fully implemented.

**Steps**
1. Implement `/api/backup` to stream CSV (or JSON) exports generated from Prisma queries, and `/api/restore` to validate + ingest CSV uploads inside a Prisma-managed transaction with per-row error reporting.
3. Port `/api/statistics` to Prisma aggregations (SUM, COUNT, GROUP BY tag/profile) including currency normalization if multi-currency transactions are involved.
5. Update UI pages to handle progress indicators, and error states based on the new API responses.
6. Add Cypress specs (`phase4-backup.cy.ts`, `phase4-statistics.cy.ts`) whose `beforeEach` resets/seeds the DB, then runs through backup download, restore upload (with sample CSV), and dashboard/statistics verification.

**UI testing on completion:** Run `npm run test:e2e -- --spec phase4-*.cy.ts`. Each spec starts from a reset/seeded DB, exercises backup/restore/statistics, and finally asserts the ledger matches the expected dataset.

