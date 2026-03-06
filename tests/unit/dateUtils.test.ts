import {
  parseGermanDate,
  todayAsGermanDateString,
  isToday,
  formatAsGermanDate,
  formatDateAsDDMMYYYY,
  tomorrowAsGermanDateString,
  getTomorrowAsDDMMYYYY,
  getGarbageCollectionDate,
  getGarbageCollectionDateFormatted,
  getNextCollectionDateFromData,
  ParseError,
} from "@/lib/dateUtils";

// ───────────── parseGermanDate ─────────────

describe("parseGermanDate", () => {
  it('parses "Di. 27.01.2026" correctly', () => {
    const d = parseGermanDate("Di. 27.01.2026");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(27);
  });

  it('parses "Mo. 01.01.2026" correctly', () => {
    const d = parseGermanDate("Mo. 01.01.2026");
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(1);
  });

  it('parses "So. 31.12.2026" correctly', () => {
    const d = parseGermanDate("So. 31.12.2026");
    expect(d.getMonth()).toBe(11);
    expect(d.getDate()).toBe(31);
  });

  it("throws ParseError on empty string", () => {
    expect(() => parseGermanDate("")).toThrow(ParseError);
  });

  it("throws ParseError on whitespace-only string", () => {
    expect(() => parseGermanDate("   ")).toThrow(ParseError);
  });

  it("throws ParseError on invalid format", () => {
    expect(() => parseGermanDate("XX. 99.99.9999")).toThrow(ParseError);
  });

  it("throws TypeError on null", () => {
    expect(() => parseGermanDate(null as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError on undefined", () => {
    expect(() => parseGermanDate(undefined as unknown as string)).toThrow(TypeError);
  });

  it("throws ParseError on number input", () => {
    expect(() => parseGermanDate(123 as unknown as string)).toThrow(ParseError);
  });

  it("throws ParseError for missing day abbreviation", () => {
    expect(() => parseGermanDate("27.01.2026")).toThrow(ParseError);
  });

  it("throws ParseError for invalid day abbreviation", () => {
    expect(() => parseGermanDate("Xy. 27.01.2026")).toThrow(ParseError);
  });

  it("throws ParseError for invalid month 13", () => {
    expect(() => parseGermanDate("Mo. 01.13.2026")).toThrow(ParseError);
  });

  it("throws ParseError for month 0", () => {
    expect(() => parseGermanDate("Mo. 01.00.2026")).toThrow(ParseError);
  });

  it("throws ParseError for day 0", () => {
    expect(() => parseGermanDate("Mo. 00.01.2026")).toThrow(ParseError);
  });

  it("throws ParseError for day 32 in January", () => {
    expect(() => parseGermanDate("Mo. 32.01.2026")).toThrow(ParseError);
  });

  it("throws ParseError for day 31 in April (30-day month)", () => {
    expect(() => parseGermanDate("Do. 31.04.2026")).toThrow(ParseError);
  });

  it("parses all 7 day abbreviations", () => {
    const dates = [
      "Mo. 05.01.2026",
      "Di. 06.01.2026",
      "Mi. 07.01.2026",
      "Do. 08.01.2026",
      "Fr. 09.01.2026",
      "Sa. 10.01.2026",
      "So. 11.01.2026",
    ];
    dates.forEach((d) => {
      expect(() => parseGermanDate(d)).not.toThrow();
    });
  });

  it("parses leap year date correctly", () => {
    const d = parseGermanDate("Sa. 29.02.2020");
    expect(d.getDate()).toBe(29);
    expect(d.getMonth()).toBe(1);
  });

  it("throws ParseError for non-leap year Feb 29", () => {
    expect(() => parseGermanDate("Do. 29.02.2021")).toThrow(ParseError);
  });

  it("handles leading/trailing whitespace via trim", () => {
    const d = parseGermanDate("  Di. 27.01.2026  ");
    expect(d.getDate()).toBe(27);
  });

  it("throws ParseError for extra text after date", () => {
    expect(() => parseGermanDate("Di. 27.01.2026 extra")).toThrow(ParseError);
  });
});

// ───────────── formatAsGermanDate ─────────────

describe("formatAsGermanDate", () => {
  it("formats a known Monday", () => {
    // 2026-01-05 is a Monday
    const d = new Date(2026, 0, 5);
    expect(formatAsGermanDate(d)).toBe("Mo. 05.01.2026");
  });

  it("formats a known Sunday", () => {
    // 2026-01-11 is a Sunday
    const d = new Date(2026, 0, 11);
    expect(formatAsGermanDate(d)).toBe("So. 11.01.2026");
  });

  it("pads single-digit day and month", () => {
    const d = new Date(2026, 0, 1);
    expect(formatAsGermanDate(d)).toBe("Do. 01.01.2026");
  });

  it("formats Dec 31 correctly", () => {
    const d = new Date(2026, 11, 31);
    expect(formatAsGermanDate(d)).toBe("Do. 31.12.2026");
  });

  it("roundtrips with parseGermanDate", () => {
    const original = new Date(2026, 5, 15); // June 15
    const formatted = formatAsGermanDate(original);
    const parsed = parseGermanDate(formatted);
    expect(parsed.getFullYear()).toBe(original.getFullYear());
    expect(parsed.getMonth()).toBe(original.getMonth());
    expect(parsed.getDate()).toBe(original.getDate());
  });
});

// ───────────── formatDateAsDDMMYYYY ─────────────

describe("formatDateAsDDMMYYYY", () => {
  it("formats date as DD.MM.YYYY", () => {
    const d = new Date(2026, 0, 27);
    expect(formatDateAsDDMMYYYY(d)).toBe("27.01.2026");
  });

  it("pads single-digit day and month", () => {
    const d = new Date(2026, 0, 5);
    expect(formatDateAsDDMMYYYY(d)).toBe("05.01.2026");
  });

  it("formats Dec 31", () => {
    const d = new Date(2026, 11, 31);
    expect(formatDateAsDDMMYYYY(d)).toBe("31.12.2026");
  });
});

// ───────────── isToday ─────────────

describe("isToday", () => {
  it("returns true when date matches today", () => {
    const today = formatAsGermanDate(new Date());
    expect(isToday(today)).toBe(true);
  });

  it("returns false for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(formatAsGermanDate(yesterday))).toBe(false);
  });

  it("returns false for tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isToday(formatAsGermanDate(tomorrow))).toBe(false);
  });

  it("returns false for invalid input (does not throw)", () => {
    expect(isToday("not-a-date")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isToday("")).toBe(false);
  });

  it("uses override to compare against a specific date", () => {
    const override = { date: "15.06.2026" };
    // June 15, 2026 is a Monday
    expect(isToday("Mo. 15.06.2026", override)).toBe(true);
    expect(isToday("Di. 16.06.2026", override)).toBe(false);
  });
});

// ───────────── todayAsGermanDateString ─────────────

describe("todayAsGermanDateString", () => {
  it("produces correct format", () => {
    const result = todayAsGermanDateString();
    expect(result).toMatch(/^(Mo\.|Di\.|Mi\.|Do\.|Fr\.|Sa\.|So\.)\s+\d{2}\.\d{2}\.\d{4}$/);
  });

  it("uses override date when provided", () => {
    const result = todayAsGermanDateString({ date: "25.12.2025" });
    expect(result).toBe("Do. 25.12.2025");
  });
});

// ───────────── tomorrowAsGermanDateString ─────────────

describe("tomorrowAsGermanDateString", () => {
  it("produces correct format", () => {
    const result = tomorrowAsGermanDateString();
    expect(result).toMatch(/^(Mo\.|Di\.|Mi\.|Do\.|Fr\.|Sa\.|So\.)\s+\d{2}\.\d{2}\.\d{4}$/);
  });

  it("returns next day when overridden", () => {
    // Dec 31 → Jan 1 next year
    const result = tomorrowAsGermanDateString({ date: "31.12.2025" });
    expect(result).toBe("Do. 01.01.2026");
  });

  it("handles month boundary", () => {
    const result = tomorrowAsGermanDateString({ date: "31.01.2026" });
    expect(result).toBe("So. 01.02.2026");
  });
});

// ───────────── getTomorrowAsDDMMYYYY ─────────────

describe("getTomorrowAsDDMMYYYY", () => {
  it("returns next day as DD.MM.YYYY", () => {
    const result = getTomorrowAsDDMMYYYY({ date: "31.12.2025" });
    expect(result).toBe("01.01.2026");
  });
});

// ───────────── getGarbageCollectionDate ─────────────

describe("getGarbageCollectionDate", () => {
  // ── Time boundary tests (same date) ──

  it("returns today's date before 06:30", () => {
    const result = getGarbageCollectionDate({ date: "15.06.2026", time: "06:00" });
    expect(result).toBe("Mo. 15.06.2026");
  });

  it("returns today's date at 06:29", () => {
    const result = getGarbageCollectionDate({ date: "15.06.2026", time: "06:29" });
    expect(result).toBe("Mo. 15.06.2026");
  });

  it("returns tomorrow's date at exactly 06:30", () => {
    const result = getGarbageCollectionDate({ date: "15.06.2026", time: "06:30" });
    expect(result).toBe("Di. 16.06.2026");
  });

  it("returns tomorrow's date at 12:00", () => {
    const result = getGarbageCollectionDate({ date: "15.06.2026", time: "12:00" });
    expect(result).toBe("Di. 16.06.2026");
  });

  it("returns tomorrow's date at 23:59", () => {
    const result = getGarbageCollectionDate({ date: "15.06.2026", time: "23:59" });
    expect(result).toBe("Di. 16.06.2026");
  });

  it("returns today at midnight (00:00)", () => {
    const result = getGarbageCollectionDate({ date: "15.06.2026", time: "00:00" });
    expect(result).toBe("Mo. 15.06.2026");
  });

  // ── Date variety: "today" before 06:30 (returns same date with correct abbreviation) ──

  it("Monday before 06:30 stays Monday", () => {
    // 2026-06-15 is Monday
    expect(getGarbageCollectionDate({ date: "15.06.2026", time: "05:00" })).toBe("Mo. 15.06.2026");
  });

  it("Tuesday before 06:30 stays Tuesday", () => {
    // 2026-06-16 is Tuesday
    expect(getGarbageCollectionDate({ date: "16.06.2026", time: "05:00" })).toBe("Di. 16.06.2026");
  });

  it("Wednesday before 06:30 stays Wednesday", () => {
    // 2026-06-17 is Wednesday
    expect(getGarbageCollectionDate({ date: "17.06.2026", time: "05:00" })).toBe("Mi. 17.06.2026");
  });

  it("Thursday before 06:30 stays Thursday", () => {
    // 2026-06-18 is Thursday
    expect(getGarbageCollectionDate({ date: "18.06.2026", time: "05:00" })).toBe("Do. 18.06.2026");
  });

  it("Friday before 06:30 stays Friday", () => {
    // 2026-06-19 is Friday
    expect(getGarbageCollectionDate({ date: "19.06.2026", time: "05:00" })).toBe("Fr. 19.06.2026");
  });

  it("Saturday before 06:30 stays Saturday", () => {
    // 2026-06-20 is Saturday
    expect(getGarbageCollectionDate({ date: "20.06.2026", time: "05:00" })).toBe("Sa. 20.06.2026");
  });

  it("Sunday before 06:30 stays Sunday", () => {
    // 2026-06-21 is Sunday
    expect(getGarbageCollectionDate({ date: "21.06.2026", time: "05:00" })).toBe("So. 21.06.2026");
  });

  // ── Date variety: "today" after 06:30 (returns tomorrow with correct abbreviation) ──

  it("Monday after 06:30 → Tuesday", () => {
    expect(getGarbageCollectionDate({ date: "15.06.2026", time: "08:00" })).toBe("Di. 16.06.2026");
  });

  it("Tuesday after 06:30 → Wednesday", () => {
    expect(getGarbageCollectionDate({ date: "16.06.2026", time: "08:00" })).toBe("Mi. 17.06.2026");
  });

  it("Wednesday after 06:30 → Thursday", () => {
    expect(getGarbageCollectionDate({ date: "17.06.2026", time: "08:00" })).toBe("Do. 18.06.2026");
  });

  it("Thursday after 06:30 → Friday", () => {
    expect(getGarbageCollectionDate({ date: "18.06.2026", time: "08:00" })).toBe("Fr. 19.06.2026");
  });

  it("Friday after 06:30 → Saturday", () => {
    expect(getGarbageCollectionDate({ date: "19.06.2026", time: "08:00" })).toBe("Sa. 20.06.2026");
  });

  it("Saturday after 06:30 → Sunday", () => {
    expect(getGarbageCollectionDate({ date: "20.06.2026", time: "08:00" })).toBe("So. 21.06.2026");
  });

  it("Sunday after 06:30 → Monday", () => {
    expect(getGarbageCollectionDate({ date: "21.06.2026", time: "08:00" })).toBe("Mo. 22.06.2026");
  });

  // ── Month-end boundaries ──

  it("Jan 31 after 06:30 → Feb 1", () => {
    // 2026-01-31 is Saturday → Feb 1 is Sunday
    expect(getGarbageCollectionDate({ date: "31.01.2026", time: "08:00" })).toBe("So. 01.02.2026");
  });

  it("Mar 31 after 06:30 → Apr 1", () => {
    // 2026-03-31 is Tuesday → Apr 1 is Wednesday
    expect(getGarbageCollectionDate({ date: "31.03.2026", time: "08:00" })).toBe("Mi. 01.04.2026");
  });

  it("Apr 30 after 06:30 → May 1", () => {
    // 2026-04-30 is Thursday → May 1 is Friday
    expect(getGarbageCollectionDate({ date: "30.04.2026", time: "08:00" })).toBe("Fr. 01.05.2026");
  });

  it("Nov 30 after 06:30 → Dec 1", () => {
    // 2026-11-30 is Monday → Dec 1 is Tuesday
    expect(getGarbageCollectionDate({ date: "30.11.2026", time: "08:00" })).toBe("Di. 01.12.2026");
  });

  // ── Year boundary ──

  it("Dec 31 after 06:30 → Jan 1 next year", () => {
    // 2025-12-31 is Wednesday → 2026-01-01 is Thursday
    expect(getGarbageCollectionDate({ date: "31.12.2025", time: "08:00" })).toBe("Do. 01.01.2026");
  });

  it("Dec 31 before 06:30 stays Dec 31", () => {
    // 2025-12-31 is Wednesday
    expect(getGarbageCollectionDate({ date: "31.12.2025", time: "05:00" })).toBe("Mi. 31.12.2025");
  });

  // ── February boundaries ──

  it("Feb 28 after 06:30 → Mar 1 in non-leap year", () => {
    // 2026-02-28 is Saturday → Mar 1 is Sunday
    expect(getGarbageCollectionDate({ date: "28.02.2026", time: "08:00" })).toBe("So. 01.03.2026");
  });

  it("Feb 28 after 06:30 → Feb 29 in leap year", () => {
    // 2028-02-28 is Monday → Feb 29 is Tuesday
    expect(getGarbageCollectionDate({ date: "28.02.2028", time: "08:00" })).toBe("Di. 29.02.2028");
  });

  it("Feb 29 after 06:30 → Mar 1 in leap year", () => {
    // 2028-02-29 is Tuesday → Mar 1 is Wednesday
    expect(getGarbageCollectionDate({ date: "29.02.2028", time: "08:00" })).toBe("Mi. 01.03.2028");
  });
});

// ───────────── getGarbageCollectionDateFormatted ─────────────

describe("getGarbageCollectionDateFormatted", () => {
  it("returns DD.MM.YYYY with (ab 06:30) before cutoff", () => {
    const result = getGarbageCollectionDateFormatted({ date: "15.06.2026", time: "05:00" });
    expect(result).toBe("15.06.2026 (ab 06:30)");
  });

  it("returns tomorrow DD.MM.YYYY with (ab 06:30) after cutoff", () => {
    const result = getGarbageCollectionDateFormatted({ date: "15.06.2026", time: "07:00" });
    expect(result).toBe("16.06.2026 (ab 06:30)");
  });

  it("always ends with (ab 06:30)", () => {
    const result = getGarbageCollectionDateFormatted({ date: "01.01.2026", time: "12:00" });
    expect(result).toMatch(/\(ab 06:30\)$/);
  });
});

// ───────────── getNextCollectionDateFromData ─────────────

type FeatureData = {
  type: string;
  features: { type: string; geometry: unknown; properties: Record<string, unknown> }[];
};

function makeData(schedules: Record<string, string[]>): FeatureData {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [10.0, 53.0] },
        properties: {
          region: "Test",
          street: "Musterstraße",
          address: "Musterstraße 1",
          waste_schedules: schedules,
        },
      },
    ],
  };
}

describe("getNextCollectionDateFromData", () => {
  it("returns the start date when it exists in the data", () => {
    const data = makeData({ Sperrmüll: ["Di. 10.03.2026"] });
    expect(getNextCollectionDateFromData(data, "Di. 10.03.2026")).toBe("Di. 10.03.2026");
  });

  it("returns the next available date when start date has no collections", () => {
    const data = makeData({ Sperrmüll: ["Di. 10.03.2026"] });
    // 07.03.2026 has no collection, next is 10.03.2026
    expect(getNextCollectionDateFromData(data, "Sa. 07.03.2026")).toBe("Di. 10.03.2026");
  });

  it("picks the earliest of multiple future dates", () => {
    const data = makeData({ Sperrmüll: ["Di. 17.03.2026", "Di. 10.03.2026", "Di. 24.03.2026"] });
    expect(getNextCollectionDateFromData(data, "Sa. 07.03.2026")).toBe("Di. 10.03.2026");
  });

  it("searches across multiple schedule types", () => {
    const data = makeData({
      Sperrmüll: ["Di. 17.03.2026"],
      Restmüll: ["Di. 10.03.2026"],
    });
    expect(getNextCollectionDateFromData(data, "Sa. 07.03.2026")).toBe("Di. 10.03.2026");
  });

  it("searches across multiple features", () => {
    const data: FeatureData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [10.0, 53.0] },
          properties: { region: "A", street: "A", address: "A", waste_schedules: { Sperrmüll: ["Di. 17.03.2026"] } },
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [10.1, 53.1] },
          properties: { region: "B", street: "B", address: "B", waste_schedules: { Sperrmüll: ["Di. 10.03.2026"] } },
        },
      ],
    };
    expect(getNextCollectionDateFromData(data, "Sa. 07.03.2026")).toBe("Di. 10.03.2026");
  });

  it("falls back to startDateStr when no future dates exist in data", () => {
    const data = makeData({ Sperrmüll: ["Di. 03.03.2026"] }); // in the past relative to start
    expect(getNextCollectionDateFromData(data, "Sa. 07.03.2026")).toBe("Sa. 07.03.2026");
  });

  it("falls back to startDateStr when data has no features", () => {
    const data: FeatureData = { type: "FeatureCollection", features: [] };
    expect(getNextCollectionDateFromData(data, "Sa. 07.03.2026")).toBe("Sa. 07.03.2026");
  });

  it("ignores features without waste_schedules", () => {
    const data: FeatureData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [10.0, 53.0] },
          properties: { region: "A", street: "A", address: "A" },
        },
      ],
    };
    expect(getNextCollectionDateFromData(data, "Sa. 07.03.2026")).toBe("Sa. 07.03.2026");
  });

  it("ignores unparseable date strings in schedules", () => {
    const data = makeData({ Sperrmüll: ["not-a-date", "Di. 10.03.2026"] });
    expect(getNextCollectionDateFromData(data, "Sa. 07.03.2026")).toBe("Di. 10.03.2026");
  });

  it("falls back when startDateStr is unparseable", () => {
    const data = makeData({ Sperrmüll: ["Di. 10.03.2026"] });
    expect(getNextCollectionDateFromData(data, "invalid")).toBe("invalid");
  });

  it("treats the start date itself as a valid match (not strictly after)", () => {
    const data = makeData({ Sperrmüll: ["Fr. 06.03.2026", "Di. 10.03.2026"] });
    expect(getNextCollectionDateFromData(data, "Fr. 06.03.2026")).toBe("Fr. 06.03.2026");
  });

  it("handles non-array schedule values gracefully", () => {
    const data: FeatureData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [10.0, 53.0] },
          properties: {
            region: "A", street: "A", address: "A",
            waste_schedules: { Sperrmüll: "Di. 10.03.2026" as unknown as string[] },
          },
        },
      ],
    };
    // Non-array value should be skipped without throwing
    expect(() => getNextCollectionDateFromData(data, "Sa. 07.03.2026")).not.toThrow();
  });
});
