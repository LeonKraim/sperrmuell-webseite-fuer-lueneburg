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
 * Format today's date into German short format string like "Di. 27.01.2026".
 */
export function todayAsGermanDateString(): string {
  const now = new Date();
  return formatAsGermanDate(now);
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
 * Return true if the raw date string matches today's date.
 */
export function isToday(raw: string): boolean {
  try {
    const parsed = parseGermanDate(raw);
    const today = new Date();
    return (
      parsed.getFullYear() === today.getFullYear() &&
      parsed.getMonth() === today.getMonth() &&
      parsed.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
}
