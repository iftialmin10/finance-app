[← Back to README](README.md)

# Security Considerations

## Security Best Practices

1. **Environment Variables**: Never commit credentials to git
2. **Password Hashing**: Use Argon2id (preferred) or bcrypt with strong parameters
3. **HTTPS**: Required for production deployment
4. **CORS**: Configure properly for API routes
5. **Session Cookies**: HTTP-only, Secure, SameSite set appropriately
6. **Rate Limiting**: Protect login and data-modifying routes against brute force
7. **Input Validation**: Validate and sanitize all inputs (Zod/validators)
8. **SQL Injection Prevention**: Use parameterized queries or a safe ORM
9. **Data Privacy**: Ensure user-specific data is isolated and protected

## Backup & Restore Security

Backups and restores are powerful operations and must be tightly controlled:

- Admin-only endpoints (`GET /api/backup`, `POST /api/restore`)
- Double confirmation required on restore (e.g., `X-Restore-Confirm` header)
- Enforce strict content-type and file-size limits for uploads
- Accept only `.zip` files; scan and validate archive structure
- Validate `manifest.json` (version, timestamps, expected tables)
- Validate CSV headers and field types before inserting
- Perform restores in a single transaction; enable maintenance/lock mode
- Verify row counts and foreign-key integrity post-restore
- Comprehensive audit logs (initiator, timestamps, outcome, counts)
- Rate-limit and CSRF-protect endpoints; require HTTPS
- Refer to `design/file-operations.md` for format, layout, and validation details.

