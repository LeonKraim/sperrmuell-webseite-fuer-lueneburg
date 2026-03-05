# Date/Time Override Guide

This application now supports overriding the system date and time for testing the sperrmüll (waste collection) logic. This is useful for testing different dates without changing your system clock.

## Usage

### Method 1: Environment Variables (Recommended for Running the Server)

Set environment variables before starting the server:

**Windows PowerShell:**
```powershell
$env:OVERRIDE_DATE = "25.12.2025"
$env:OVERRIDE_TIME = "14:30"
npm run dev
```

**Windows CMD:**
```cmd
set OVERRIDE_DATE=25.12.2025
set OVERRIDE_TIME=14:30
npm run dev
```

**Linux/macOS:**
```bash
export OVERRIDE_DATE="25.12.2025"
export OVERRIDE_TIME="14:30"
npm run dev
```

### Method 2: Query Parameters (For API Calls and Testing)

Add query parameters to API calls:

```
GET /api/today?overrideDate=25.12.2025&overrideTime=14:30
GET /api/export?format=geojson&overrideDate=25.12.2025&overrideTime=14:30
```

### Method 3: Combined (Direct App URL)

If the client needs to override dates, modify the MapView component to pass overrides to the API:

```typescript
// From browser console or in code:
fetch('/api/today?overrideDate=25.12.2025&overrideTime=14:30')
```

## Format Requirements

- **Date Format**: `DD.MM.YYYY` (e.g., `25.12.2025` for December 25, 2025)
- **Time Format**: `HH:MM` in 24-hour format (e.g., `14:30` for 2:30 PM)

## Validation

The parser validates:
- Valid month (01-12)
- Valid day for the given month and year (including leap years)
- Valid hour (00-23)
- Valid minute (00-59)

Invalid formats will raise errors logged to the console.

## Examples

### Test tomorrow's waste schedule on a specific date:
```powershell
$env:OVERRIDE_DATE = "06.03.2026"
npm run dev
```

### Test waste schedule at a specific time:
```powershell
$env:OVERRIDE_DATE = "06.03.2026"
$env:OVERRIDE_TIME = "23:59"
npm run dev
```

### API call with overrides:
```bash
curl "http://localhost:3000/api/today?overrideDate=25.12.2025&overrideTime=14:30"
```

## Testing

The override doesn't affect client logging timestamps (which still use system time). It only affects:
- Waste schedule filtering (which collection date to show)
- "Tomorrow" date calculations
- Export date formatting

## Notes

- If only `OVERRIDE_DATE` is set, the time uses current system time
- If only `OVERRIDE_TIME` is set, it's applied to today's date
- Environment variables take precedence over system defaults
- Query parameters are available for API testing and scenarios where you can't control environment variables
