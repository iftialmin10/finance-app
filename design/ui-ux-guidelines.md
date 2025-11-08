[← Back to README](README.md)

# UI/UX Design Guidelines

## Theme
- Primary Color: #1976d2 (Material Blue)
- Secondary Color: #dc004e (Pink)
- Success: #4caf50 (Green)
- Error: #f44336 (Red)
- Background: #fafafa (Light Gray)

## Spacing
- Use MUI spacing system (8px base unit)
- Padding: 2-4 units (16px-32px)
- Margins: 1-3 units (8px-24px)

## Responsive Design
- Mobile-first approach
- Breakpoints:
  - xs: 0px
  - sm: 600px
  - md: 960px
  - lg: 1280px
  - xl: 1920px

## Motion and Animation
- All UI transitions and the initial rendering of UI elements must use smooth animations.
- Durations:
  - Micro-interactions (hover, press, chip changes): 100–200ms
  - Component transitions (dialogs, drawers, accordions, list add/remove): 150–300ms
  - Page/route transitions: 200–400ms
- Easing:
  - Use ease-out for enters and ease-in for exits, or a consistent ease-in-out curve across the app.
- Performance:
  - Target 60fps; animate `opacity` and `transform` properties; avoid layout-affecting properties (width/height/top/left) when possible.
- Accessibility:
  - Respect `prefers-reduced-motion`; reduce or disable non-essential animations when enabled.
- Consistency:
  - Use shared motion tokens/variants and consistent travel distances (e.g., 8–16px slide).
- Loading:
  - Prefer skeletons/shimmers and fade-in for content; avoid abrupt pop-in/out.
- Tooling:
  - Prefer framework utilities (e.g., MUI `Fade`, `Grow`, `Slide`) or CSS transitions for consistency.

## Currency Display Guidelines
- **Currency Symbols**: Use appropriate currency symbols ($ £ € ¥) when displaying amounts
- **Formatting**: Format numbers according to currency locale
  - USD: $1,234.56
  - EUR: €1.234,56
  - GBP: £1,234.56
- **Currency Selector**: Use autocomplete dropdown with search for easy currency selection
- **Exchange Rate Display**: Show exchange rates clearly with examples in Manage Currencies
- **Conversion Indicator**: When viewing statistics, clearly indicate the display currency
- **Multi-Currency Labels**: In expense/income tables, show currency code next to amounts

## Performance Considerations

### Optimization Strategies
1. **Code Splitting**: Dynamic imports for routes
2. **Lazy Loading**: Load components on demand
3. **Memoization**: Use React.memo for expensive components

### Loading States
- **Global infinite progress bar** for API calls
- Skeleton screens for content loading
- Local progress indicators for specific operations
- Optimistic UI updates for better perceived performance

**API Call Handling:**
- Every API call that hits the server triggers the global infinite progress bar
- Progress bar appears at the top of the page (Material UI LinearProgress with indeterminate mode)
- Automatically shows when request starts and hides when complete
- Multiple concurrent requests keep the progress bar visible until all complete
- Provides consistent user feedback across all pages and operations

## User Experience Best Practices

### General
- Display active profile name prominently in the dashboard
- Make profile switching intuitive and easily accessible
- Provide clear explanations about profile separation during setup
- Show confirmation dialogs when deleting profiles to prevent accidental data loss

### Profile Management
- No profile photo storage; keep profile visuals simple and text-focused

### Transaction Management
- Pre-select user's base/default currency in transaction forms
- Color-coded amounts (red for expenses, green for incomes)
- Type badges for quick identification
- Month summary showing total income, total expense, and net balance

### Currency Management
- Clearly indicate which currency is the base currency throughout the app
- Provide quick links to Manage Currencies when needed
- Display clear conversion information in statistics (e.g., "All amounts shown in USD")
- Use consistent currency formatting throughout app
- Show currency symbols where appropriate ($ £ € ¥)
- Explain base currency concept during first-time setup with clear, simple language

### Loading and Feedback
- Global progress bar provides consistent feedback for API operations without cluttering the UI
- Local spinners for specific component operations
- Success messages and error notifications via snackbar

## Backups UI

### Page Layout
- Header with active profile name and two primary actions:
  - \"Download Backup\" (primary)
  - \"Restore from ZIP\" (secondary, danger context)
- No server-side list is displayed; backups are downloaded to the user's machine as a single `.zip`.

### Actions
- Download Backup:
  - Confirmation dialog explains a full database backup (CSV-in-zip) will be created
  - Show global progress bar during export
  - Trigger browser download of `backup-YYYYMMDDTHHmmssZ.zip`
- Restore from ZIP:
  - Danger-styled action; requires double confirmation
  - Type-to-confirm app/profile name to proceed
  - File picker accepts `.zip` only
  - Show global progress bar during restore
  - After success, reload affected data and show success snackbar

### Edge Cases
- Handle authorization failures with clear remediation steps (e.g., re-authenticate)


