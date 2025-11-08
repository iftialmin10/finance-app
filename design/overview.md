[← Back to README](README.md)

# Overview

This document provides an overview of the finance-app personal finance tracking application.

## Key Features

### Core Functionality
1. **PostgreSQL Storage (Neon)**: All data stored in a managed PostgreSQL database
2. **Profile Management**: Create and manage multiple profiles (e.g., Personal, Business) with separate data
3. **Relational Data Management**: Normalized tables for transactions, tags, and currencies
4. **Multi-Currency Support**: Track expenses and incomes in different currencies with monthly exchange rates
5. **Expense & Income Tracking**: Categorized financial records with tags
6. **Visual Statistics**: Pie charts and summaries with currency conversion
7. **Tag Management**: Customizable categories with color coding
8. **Currency Management**: Month-specific exchange rate tracking
9. **Mobile-First PWA**: Works on all devices, installable as Android app
10. **Backup & Restore**: Full database backup to a single `.zip` of CSVs (download); full restore by uploading that `.zip`.

### Multi-Currency System
- **Monthly Exchange Rates**: Define different rates for each month to maintain historical accuracy
- **User-Selected Base Currency**: User chooses their base currency during first-time setup (defaults to USD)
- **Base Currency for Conversions**: All conversions use the base currency as the intermediate currency
- **Flexible Display**: View statistics in any currency available for that month
- **Automatic Conversion**: All calculations automatically convert between currencies
- **Per-Transaction Currency**: Each expense/income can be in different currencies

### Profile System
- **Multiple Profiles**: Users can create multiple profiles (e.g., Personal, Business, Family) to keep finances separate
- **Profile-Based Data Isolation**: Each profile has its own transactions, tags, and currencies in the database
- **Active Profile Selection**: Users choose which profile to use when starting the app
- **Easy Profile Switching**: Switch between profiles from the dashboard without re-authentication
- **Independent Management**: Each profile can have different tags, currencies, and transaction history
