[← Back to README](README.md)

# Application Architecture

## High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Next.js App (React + TypeScript)              │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ Global Progress Bar (for API calls)              │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   UI Layer   │  │  State Mgmt  │  │  Auth Layer  │ │ │
│  │  │   (MUI)      │  │  (Context)   │  │ (Credentials)│ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Routes                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Auth API    │  │  Domain APIs │  │  Services    │     │
│  │              │  │  (CRUD)      │  │  (Reports)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data & Infrastructure                  │
│  ┌────────────────────────┐  ┌──────────────────────────┐  │
│  │   Auth & Sessions      │  │  PostgreSQL (Neon)       │  │
│  │ (Credentials + Cookies)│  │  (Primary Data Store)    │  │
│  └────────────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Context API
- **Authentication**: Credentials (email + password) with HTTP-only session cookie
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Storage**: PostgreSQL (Neon)
- **Data Format**: Normalized relational schema

### Deployment
- **Container**: Docker
- **Platform**: Cloud hosting of choice
- **PWA**: Progressive Web App with Service Worker
- **Mobile**: Bubblewrap for Android packaging

## Key Architectural Decisions

1. **Database-backed Storage**: Normalize core entities (profiles, transactions, tags, currencies) in PostgreSQL (Neon).
2. **Session-based Auth**: First-party credentials with HTTP-only cookies; no third-party OAuth.
3. **Profile Isolation**: Row-level ownership enforcement via service-layer checks (per-user `profiles`).
4. **Mobile-First PWA**: Responsive design that works on all devices and can be installed as an app
5. **Global Progress Indicator**: Unified loading feedback for API calls
6. **Backups**: Full database backup to CSV files packaged in a single `.zip` for download; full restore by uploading that `.zip`.

## Data & Reporting Services

### Responsibilities
- Aggregations and reporting (by date ranges, tags, categories)
- Full backup/restore endpoints:
  - `GET /api/backup` → streams `.zip` of CSVs + manifest
  - `POST /api/restore` → uploads `.zip` and restores transactionally
- Data retention and housekeeping tasks

### Notes
- Use parameterized queries/ORM to prevent SQL injection.
- Encapsulate authorization checks in service functions close to data access.

