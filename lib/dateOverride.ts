/**
 * Date/Time Override Utilities
 * Allows overriding the system date/time via environment variables or function parameters
 * 
 * Environment Variables:
 * - OVERRIDE_DATE: DD.MM.YYYY format (e.g., "25.12.2025")
 * - OVERRIDE_TIME: HH:MM format (e.g., "14:30")
 * 
 * Query Parameters:
 * - overrideDate: DD.MM.YYYY format
 * - overrideTime: HH:MM format
 */

export interface DateTimeOverride {
  date?: string; // DD.MM.YYYY format
  time?: string; // HH:MM format
}

/**
 * Parse DD.MM.YYYY or D.M.YYYY format date string into Date object
 * Accepts both with and without leading zeros
 */
export function parseDDMMYYYY(dateStr: string): Date {
  const match = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) {
    throw new Error(`Invalid date format: "${dateStr}". Expected DD.MM.YYYY or D.M.YYYY`);
  }

  const [, dayStr, monthStr, yearStr] = match;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  if (month < 1 || month > 12) {
    throw new Error(`Invalid month ${month} in date: "${dateStr}"`);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    throw new Error(`Invalid day ${day} for month ${month} in date: "${dateStr}"`);
  }

  return new Date(year, month - 1, day);
}

/**
 * Parse HH:MM or H:MM format time string and apply to a date
 * Accepts both with and without leading zeros
 */
export function applyHHMMTime(date: Date, timeStr: string): Date {
  const match = timeStr.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) {
    throw new Error(`Invalid time format: "${timeStr}". Expected HH:MM or H:MM`);
  }

  const [, hourStr, minStr] = match;
  const hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);

  if (hour < 0 || hour > 23) {
    throw new Error(`Invalid hour ${hour} in time: "${timeStr}"`);
  }

  if (min < 0 || min > 59) {
    throw new Error(`Invalid minute ${min} in time: "${timeStr}"`);
  }

  const result = new Date(date);
  result.setHours(hour, min, 0, 0);
  return result;
}

/**
 * Get override values from environment variables
 */
export function getOverrideFromEnv(): DateTimeOverride {
  const overrideDate = process.env.OVERRIDE_DATE;
  const overrideTime = process.env.OVERRIDE_TIME;

  return {
    date: overrideDate,
    time: overrideTime,
  };
}

/**
 * Get override values from URL search parameters
 */
export function getOverrideFromParams(params: URLSearchParams): DateTimeOverride {
  return {
    date: params.get("overrideDate") ?? undefined,
    time: params.get("overrideTime") ?? undefined,
  };
}

/**
 * Create a Date object with overrides applied
 * Priority: explicit override param > environment variable > current date/time
 */
export function getOverriddenDate(override?: DateTimeOverride): Date {
  // Get environment variables
  const envOverride = getOverrideFromEnv();
  
  // Merge: query params override env vars, env vars override defaults
  const finalOverride = {
    date: override?.date || envOverride.date,
    time: override?.time || envOverride.time,
  };

  let date: Date;

  if (finalOverride.date) {
    try {
      date = parseDDMMYYYY(finalOverride.date);
    } catch (err) {
      throw new Error(
        `Failed to parse override date "${finalOverride.date}": ${err instanceof Error ? err.message : String(err)}`
      );
    }
  } else {
    date = new Date();
  }

  if (finalOverride.time) {
    try {
      date = applyHHMMTime(date, finalOverride.time);
    } catch (err) {
      throw new Error(
        `Failed to parse override time "${finalOverride.time}": ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return date;
}
