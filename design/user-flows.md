[← Back to README](README.md)

# User Flows

## 1. First-Time User Flow
```
Start → Sign In Required → 
Create Account or Sign In (Email + Password) → 
Setup Page → 
  Step 1: Welcome & Introduction →
  Step 2: Create Profile (Enter Profile Name) →
  Step 3: Choose Base Currency (from dropdown or custom input) →
  Step 4: Initialize Database Records (default tags, base currency) → 
Dashboard
```

**Profile & Base Currency Selection Details:**
- User is presented with a "Create Profile" step
- User creates first profile with a name
- User selects their primary currency (default: USD)
- System creates profile record in the database
- System initializes currencies with selected base currency (ratio 1.0) in DB
- System initializes tags in DB
- All future transactions default to this currency
- Can be changed later in app settings
- User can create multiple profiles

## 2. Create Transaction Flow (Expense or Income)
```
Dashboard → Create Transaction Button → 
Transaction Form → 
User Selects Transaction Type (Expense/Income toggle) →
Fill Details (Date, Amount, Currency, Description, Tag filtered by type) → 
Validate → Check if Currency exists in DB for that month →
If not exists: Show warning or auto-add with ratio 1.0 →
Save to database with selected transactionType → 
Success Message → Dashboard or Stay to Add Another
```

**Key UX Features:**
- Default transaction type can be expense (most common) or last used type
- Switching type updates available tags dynamically
- Quick toggle to add multiple transactions of different types

## 3. View Transactions Flow
```
Dashboard → View Transactions Button → 
Query transactions from DB → Group by Year/Month → 
Display List with Filter Controls (All/Expense/Income) → 
User Selects Filter Type (default: All) → 
User Selects Month → 
Fetch data → Filter by selected transactionType → Display Table → 
Optional: Edit or Delete Row → Persist changes in DB →
Refresh Display
```

**Key UX Features:**
- Type filter tabs with transaction counts badges
- Color-coded amounts (red for expense, green for income)
- Month totals showing income, expense, and net balance
- Search/filter by description or tag

## 4. View Statistics Flow
```
Dashboard → Statistics Button → 
Select Year → Select Month → 
Load transactions from DB → 
Filter expenses (transactionType === 'expense') → 
Filter incomes (transactionType === 'income') → 
Load currencies for selected month/year from DB →
Determine available currencies from records → 
Populate Display Currency dropdown → 
User selects display currency (default: USD or user's default) →
Convert all amounts to selected currency using exchange rates → 
Aggregate data by tags → 
Render Pie Chart & Summary in selected currency → 
Display Results
```

## 5. Edit Tags Flow
```
Dashboard → Edit Tags Button → 
Load tags from DB → Display Tags → 
User Edits (Add/Delete/Modify) → 
Validate → Save to DB → 
Success Message
```

## 6. Manage Currencies Flow
```
Dashboard → Manage Currencies Button → 
Load currencies from DB → Group by Year/Month → Display List → 
User Actions:
  - Add Currency: Enter Name, Year, Month, Ratio → Validate → Save
  - Edit Ratio: Update ratio value → Validate → Save
  - Delete Currency: Confirm → Remove from DB → Save
Success Message
```

## 7. Profile Management Flow
```
Dashboard → Manage Profiles Button → 
Load Profiles List from DB → Display Active Profile → 
User Actions:
  - Switch Profile: Select Profile → Update active selection in DB/user state → Reload Dashboard
  - Create Profile: Enter Profile Name → Generate Profile ID → 
    Initialize default records (tags, currencies) in DB
  - Rename Profile: Select Profile → Enter New Name → Update profile name in DB
  - Delete Profile: Select Profile (non-active) → Confirm → Remove from DB
Success Message
```

## 8. App Startup Profile Selection Flow
```
App Load → Check session and user settings in DB → 
If active profile exists: Load Active Profile Data → Dashboard
If no active profile or profiles empty: Redirect to Setup/Create Profile Flow
User can switch profile anytime from Dashboard
```

## 9. Backup & Restore Flow
```
Dashboard → Backup & Restore →
User Actions:
  - Download Full Backup:
    Click "Download Backup" → Confirm →
    Global progress bar shows while creating export →
    Browser downloads `backup-YYYYMMDDTHHmmssZ.zip`
  - Restore From Backup:
    Click "Restore from ZIP" → Choose file →
    Warning dialog (destructive) with type-to-confirm →
    Global progress bar shows while restoring →
    On success: data refresh → Success Message
```

**Key UX Features:**
- Backups are full database snapshots as CSVs packaged in a single `.zip`
- Timestamp format `YYYY-MM-DDTHH:mm:ssZ` in filenames (display localized in UI)
- Double-confirmation on restore (type-to-confirm)
- All actions surface progress via the global progress bar

