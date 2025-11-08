[← Back to README](README.md)

# Authentication & Security

## Authentication Flow

### Credentials (Email + Password) with PostgreSQL (Neon)
1. User navigates to Sign Up or Sign In.
2. Sign Up:
   - Submit email and password.
   - Server validates, hashes password (Argon2id preferred), creates user in `users` table.
   - Optional: send verification email; mark `email_verified_at` upon confirmation.
3. Sign In:
   - Submit email and password.
   - Server verifies credentials, then issues session:
     - Option A: Create `sessions` row with random opaque token (store hash); set HTTP-only cookie.
     - Option B: Issue short-lived JWT and persist refresh token in DB.
4. Authenticated requests include the session cookie (or JWT). Middleware loads user from DB and attaches to request context.
5. Logout invalidates the session (delete session row and clear cookie).

### Session Management
- HTTP-only cookie for session; `Secure` in production and `SameSite=Lax` or `Strict`.
- Session expiry: 7–30 days (configurable). Idle timeout recommended.
- Refresh token rotation if using JWT; otherwise rotate opaque session tokens periodically.
- Store only token hashes in DB to prevent token leakage.

## Security Considerations

### Data Privacy
- User account, profile, and application data are stored in PostgreSQL (Neon).
- Only minimal user PII is stored (e.g., email). No profile photo storage.
- Users can only access rows they own; enforce row-level authorization in service layer.

### API Security
- CSRF protection for state-changing requests (double-submit cookie or CSRF token).
- Rate limiting on API routes
- Input validation and sanitization
- SQL injection prevention (parameterized queries/ORM)

### Authorization
- Role-based access control (RBAC) with `roles` and `user_roles` tables (or a `role` column).
- Fine-grained checks at the service layer per route/action.

## Error Handling

### Client-Side Errors
- Form validation errors: Display inline below fields
- Network errors: Show snackbar with retry option
- Authentication errors: Show inline errors; throttle repeated failures

### Server-Side Errors
- 401 Unauthorized: Re-authenticate
- 403 Forbidden: Show permission error
- 404 Not Found: Show empty state
- 500 Server Error: Show error page with support info

### Logging
- Client: Console errors in development
- Server: Structured logging with timestamps
- Production: Error tracking service (optional)

## Database Schema (Auth)

### Tables
- `users`
  - `id` UUID primary key
  - `email` text unique not null
  - `password_hash` text not null
  - `email_verified_at` timestamptz null
  - `created_at` timestamptz default now()
  - `updated_at` timestamptz default now()
- `sessions` (if using opaque tokens)
  - `id` UUID primary key
  - `user_id` UUID references `users(id)` on delete cascade
  - `token_hash` text unique not null
  - `expires_at` timestamptz not null
  - `created_at` timestamptz default now()
- `roles` (optional)
  - `id` serial primary key
  - `name` text unique not null
- `user_roles` (optional)
  - `user_id` UUID references `users(id)` on delete cascade
  - `role_id` int references `roles(id)` on delete cascade
  - primary key (`user_id`, `role_id`)

## Auth Endpoints
- `POST /api/auth/register` — Create user. Validate email/password, hash, insert.
- `POST /api/auth/login` — Verify credentials, create session/JWT, set cookie.
- `POST /api/auth/logout` — Invalidate current session, clear cookie.
- `GET /api/auth/session` — Return authenticated user context.

### Environment Variables
```
DATABASE_URL=postgres://user:password@host:port/dbname?sslmode=require  # Neon connection string
SESSION_COOKIE_NAME=app_session
JWT_SECRET=your_jwt_secret_if_applicable
```
