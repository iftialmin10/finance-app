[← Back to README](README.md)

# Authentication

## Overview

### Database-backed Authentication (PostgreSQL on Neon)
- Use a first-party credentials flow (email + password) backed by PostgreSQL (Neon).
- Store users in a `users` table with a strong password hash (Argon2id preferred; bcrypt as fallback).
- Manage sessions via an HTTP-only cookie:
  - Option A: Server-side sessions table (`sessions`) with opaque, random tokens (store only token hashes).
  - Option B: Short-lived JWT with rotation and refresh tokens persisted in DB.
- Provide endpoints for register, login, logout, and session refresh.
- Include optional email verification and password reset flows.

### Notes
- Keep authentication concerns decoupled from app-specific authorization logic.
- Store tokens securely (HTTP-only, Secure, SameSite) and enforce CSRF protection on state-changing routes.
- Enforce sensible policies: password strength, login throttling/rate limits, and account lockout/backoff.

