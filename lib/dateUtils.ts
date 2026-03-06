import { getOverriddenDate, DateTimeOverride } from "./dateOverride";

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

/**
 * Parse a German date string like "Di. 27.01.2026" into a Date object.
 * Throws ParseError if format is unrecognised.
 */
export function parseGermanDate(raw: string): Date {
  if (raw === null || raw === undefined) {
    throw new TypeError("Date string must not be null or undefined");
  }
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new ParseError(`Empty or invalid date string: "${raw}"`);
  }

  const trimmed = raw.trim();
  const pattern = /^(Mo\.|Di\.|Mi\.|Do\.|Fr\.|Sa\.|So\.)\s+(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = trimmed.match(pattern);

  if (!match) {
    throw new ParseError(`Unrecognised date format: "${raw}"`);
  }

  const [, , dayStr, monthStr, yearStr] = match;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  if (month < 1 || month > 12) {
    throw new ParseError(`Invalid month ${month} in date: "${raw}"`);
  }

  // Validate day range
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    throw new ParseError(`Invalid day ${day} for month ${month} in date: "${raw}"`);
  }

  return new Date(year, month - 1, day);
}

/**
 * Format a Date into German short format string like "Di. 27.01.2026".
 */
export function formatAsGermanDate(date: Date): string {
  const dayIndex = date.getDay(); // 0=Sun, 1=Mon, ...
  // Map JS day index to German abbreviations
  const dayMap: Record<number, string> = {
    0: "So.",
    1: "Mo.",
    2: "Di.",
    3: "Mi.",
    4: "Do.",
    5: "Fr.",
    6: "Sa.",
  };
  const dayAbbrev = dayMap[dayIndex];
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return `${dayAbbrev} ${dd}.${mm}.${yyyy}`;
}

/**
 * Format a Date into DD.MM.YYYY format without day of week.
 */
export function formatDateAsDDMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return `${dd}.${mm}.${yyyy}`;
}

/**
 * Format today's date into German short format string like "Di. 27.01.2026".
 * Supports optional date/time override via environment variables or parameter.
 * 
 * @param override Optional date/time override {date: 'DD.MM.YYYY', time: 'HH:MM'}
 */
export function todayAsGermanDateString(override?: DateTimeOverride): string {
  const now = getOverriddenDate(override);
  return formatAsGermanDate(now);
}

/**
 * Return true if the raw date string matches today's date.
 * Supports optional date/time override via environment variables or parameter.
 * 
 * @param raw The date string to check
 * @param override Optional date/time override {date: 'DD.MM.YYYY', time: 'HH:MM'}
 */
export function isToday(raw: string, override?: DateTimeOverride): boolean {
  try {
    const parsed = parseGermanDate(raw);
    const today = getOverriddenDate(override);
    return (
      parsed.getFullYear() === today.getFullYear() &&
      parsed.getMonth() === today.getMonth() &&
      parsed.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
}

/**
 * Format tomorrow's date into German short format string like "Do. 06.03.2026".
 * Supports optional date/time override via environment variables or parameter.
 * 
 * @param override Optional date/time override {date: 'DD.MM.YYYY', time: 'HH:MM'}
 */
export function tomorrowAsGermanDateString(override?: DateTimeOverride): string {
  const today = getOverriddenDate(override);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatAsGermanDate(tomorrow);
}

/**
 * Get tomorrow's date formatted as DD.MM.YYYY.
 * Supports optional date/time override via environment variables or parameter.
 * 
 * @param override Optional date/time override {date: 'DD.MM.YYYY', time: 'HH:MM'}
 */
export function getTomorrowAsDDMMYYYY(override?: DateTimeOverride): string {
  const today = getOverriddenDate(override);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateAsDDMMYYYY(tomorrow);
}

/**
 * Get the garbage collection date.
 * Before 06:30: returns today's date
 * From 06:30 onwards: returns tomorrow's date
 * Returns in German format with day of week: "Di. 27.01.2026"
 * 
 * @param override Optional date/time override {date: 'DD.MM.YYYY', time: 'HH:MM'}
 */
export function getGarbageCollectionDate(override?: DateTimeOverride): string {
  const now = getOverriddenDate(override);
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeInMinutes = hour * 60 + minute;
  const cutoffTimeInMinutes = 6 * 60 + 30; // 06:30

  let collectionDate: Date;
  if (timeInMinutes < cutoffTimeInMinutes) {
    // Before 06:30: use today
    collectionDate = new Date(now);
  } else {
    // From 06:30 onwards: use tomorrow
    collectionDate = new Date(now);
    collectionDate.setDate(collectionDate.getDate() + 1);
  }

  return formatAsGermanDate(collectionDate);
}

/**
 * Get the garbage collection date formatted as DD.MM.YYYY with time notation.
 * Before 06:30: returns today's date with "(ab 06:30)" notation
 * From 06:30 onwards: returns tomorrow's date with "(ab 06:30)" notation
 * 
 * @param override Optional date/time override {date: 'DD.MM.YYYY', time: 'HH:MM'}
 */
export function getGarbageCollectionDateFormatted(override?: DateTimeOverride): string {
  const now = getOverriddenDate(override);
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeInMinutes = hour * 60 + minute;
  const cutoffTimeInMinutes = 6 * 60 + 30; // 06:30

  let collectionDate: Date;
  if (timeInMinutes < cutoffTimeInMinutes) {
    // Before 06:30: use today
    collectionDate = new Date(now);
  } else {
    // From 06:30 onwards: use tomorrow
    collectionDate = new Date(now);
    collectionDate.setDate(collectionDate.getDate() + 1);
  }

  const dateStr = formatDateAsDDMMYYYY(collectionDate);
  return `${dateStr} (ab 06:30)`;
}

/**
 * Given GeoJSON data and a starting German date string, find the earliest date
 * in the data (>= startDateStr) that has at least one waste collection.
 * Falls back to startDateStr if no future collection date is found.
 *
 * @param data The GeoJSON feature collection
 * @param startDateStr German format date string like "Sa. 07.03.2026"
 */
export function getNextCollectionDateFromData(
  data: { features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] },
  startDateStr: string
): string {
  const allDates = new Set<string>();
  for (const feature of data.features || []) {
    const schedules = (feature.properties?.waste_schedules) as Record<string, string[]> | undefined;
    if (!schedules || typeof schedules !== "object") continue;
    for (const dates of Object.values(schedules)) {
      if (Array.isArray(dates)) for (const d of dates) allDates.add(d);
    }
  }

  let startDate: Date;
  try {
    startDate = parseGermanDate(startDateStr);
  } catch {
    return startDateStr;
  }

  let earliest: { raw: string; date: Date } | null = null;
  for (const raw of allDates) {
    try {
      const d = parseGermanDate(raw);
      if (d >= startDate && (!earliest || d < earliest.date)) {
        earliest = { raw, date: d };
      }
    } catch {
      // skip unparseable entries
    }
  }

  return earliest?.raw ?? startDateStr;
}
