import {
  parseDDMMYYYY,
  applyHHMMTime,
  getOverrideFromEnv,
  getOverrideFromParams,
  getOverriddenDate,
  DateTimeOverride,
} from "@/lib/dateOverride";

// ───────────── parseDDMMYYYY ─────────────

describe("parseDDMMYYYY", () => {
  it("parses standard DD.MM.YYYY format", () => {
    const d = parseDDMMYYYY("27.01.2026");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(27);
  });

  it("parses single-digit day and month (D.M.YYYY)", () => {
    const d = parseDDMMYYYY("5.1.2026");
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(5);
  });

  it("parses Dec 31", () => {
    const d = parseDDMMYYYY("31.12.2026");
    expect(d.getMonth()).toBe(11);
    expect(d.getDate()).toBe(31);
  });

  it("parses leap year Feb 29", () => {
    const d = parseDDMMYYYY("29.02.2020");
    expect(d.getDate()).toBe(29);
    expect(d.getMonth()).toBe(1);
  });

  it("throws for non-leap year Feb 29", () => {
    expect(() => parseDDMMYYYY("29.02.2021")).toThrow("Invalid day");
  });

  it("throws for month 0", () => {
    expect(() => parseDDMMYYYY("01.00.2026")).toThrow("Invalid month");
  });

  it("throws for month 13", () => {
    expect(() => parseDDMMYYYY("01.13.2026")).toThrow("Invalid month");
  });

  it("throws for day 0", () => {
    expect(() => parseDDMMYYYY("00.01.2026")).toThrow("Invalid day");
  });

  it("throws for day 32", () => {
    expect(() => parseDDMMYYYY("32.01.2026")).toThrow("Invalid day");
  });

  it("throws for empty string", () => {
    expect(() => parseDDMMYYYY("")).toThrow("Invalid date format");
  });

  it("throws for random text", () => {
    expect(() => parseDDMMYYYY("not-a-date")).toThrow("Invalid date format");
  });

  it("throws for ISO format (YYYY-MM-DD)", () => {
    expect(() => parseDDMMYYYY("2026-01-27")).toThrow("Invalid date format");
  });

  it("throws for date with extra text", () => {
    expect(() => parseDDMMYYYY("27.01.2026 extra")).toThrow("Invalid date format");
  });
});

// ───────────── applyHHMMTime ─────────────

describe("applyHHMMTime", () => {
  const baseDate = new Date(2026, 0, 15); // Jan 15, 2026

  it("sets hours and minutes correctly", () => {
    const result = applyHHMMTime(baseDate, "14:30");
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("handles midnight (00:00)", () => {
    const result = applyHHMMTime(baseDate, "00:00");
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it("handles 23:59", () => {
    const result = applyHHMMTime(baseDate, "23:59");
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
  });

  it("accepts single-digit hour (6:30)", () => {
    const result = applyHHMMTime(baseDate, "6:30");
    expect(result.getHours()).toBe(6);
    expect(result.getMinutes()).toBe(30);
  });

  it("does not mutate the input date", () => {
    const original = new Date(2026, 0, 15, 10, 0);
    const originalTime = original.getTime();
    applyHHMMTime(original, "14:30");
    expect(original.getTime()).toBe(originalTime);
  });

  it("preserves the date portion", () => {
    const result = applyHHMMTime(baseDate, "14:30");
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it("throws for hour 24", () => {
    expect(() => applyHHMMTime(baseDate, "24:00")).toThrow("Invalid hour");
  });

  it("throws for hour -1", () => {
    expect(() => applyHHMMTime(baseDate, "-1:00")).toThrow("Invalid time format");
  });

  it("throws for minute 60", () => {
    expect(() => applyHHMMTime(baseDate, "12:60")).toThrow("Invalid minute");
  });

  it("throws for random text", () => {
    expect(() => applyHHMMTime(baseDate, "noon")).toThrow("Invalid time format");
  });

  it("throws for empty string", () => {
    expect(() => applyHHMMTime(baseDate, "")).toThrow("Invalid time format");
  });
});

// ───────────── getOverrideFromEnv ─────────────

describe("getOverrideFromEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns empty override when no env vars set", () => {
    delete process.env.OVERRIDE_DATE;
    delete process.env.OVERRIDE_TIME;
    const result = getOverrideFromEnv();
    expect(result.date).toBeUndefined();
    expect(result.time).toBeUndefined();
  });

  it("reads OVERRIDE_DATE from env", () => {
    process.env.OVERRIDE_DATE = "25.12.2025";
    const result = getOverrideFromEnv();
    expect(result.date).toBe("25.12.2025");
  });

  it("reads OVERRIDE_TIME from env", () => {
    process.env.OVERRIDE_TIME = "14:30";
    const result = getOverrideFromEnv();
    expect(result.time).toBe("14:30");
  });

  it("reads both env vars", () => {
    process.env.OVERRIDE_DATE = "25.12.2025";
    process.env.OVERRIDE_TIME = "14:30";
    const result = getOverrideFromEnv();
    expect(result.date).toBe("25.12.2025");
    expect(result.time).toBe("14:30");
  });
});

// ───────────── getOverrideFromParams ─────────────

describe("getOverrideFromParams", () => {
  it("returns empty override when no params", () => {
    const params = new URLSearchParams();
    const result = getOverrideFromParams(params);
    expect(result.date).toBeUndefined();
    expect(result.time).toBeUndefined();
  });

  it("reads overrideDate param", () => {
    const params = new URLSearchParams("overrideDate=25.12.2025");
    const result = getOverrideFromParams(params);
    expect(result.date).toBe("25.12.2025");
  });

  it("reads overrideTime param", () => {
    const params = new URLSearchParams("overrideTime=14:30");
    const result = getOverrideFromParams(params);
    expect(result.time).toBe("14:30");
  });

  it("reads both params", () => {
    const params = new URLSearchParams("overrideDate=25.12.2025&overrideTime=14:30");
    const result = getOverrideFromParams(params);
    expect(result.date).toBe("25.12.2025");
    expect(result.time).toBe("14:30");
  });
});

// ───────────── getOverriddenDate ─────────────

describe("getOverriddenDate", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.OVERRIDE_DATE;
    delete process.env.OVERRIDE_TIME;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns current date when no override", () => {
    const before = Date.now();
    const result = getOverriddenDate();
    const after = Date.now();
    expect(result.getTime()).toBeGreaterThanOrEqual(before - 1000);
    expect(result.getTime()).toBeLessThanOrEqual(after + 1000);
  });

  it("applies date override", () => {
    const result = getOverriddenDate({ date: "25.12.2025" });
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(25);
  });

  it("applies time override", () => {
    const result = getOverriddenDate({ date: "15.06.2026", time: "14:30" });
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it("param override takes priority over env var", () => {
    process.env.OVERRIDE_DATE = "01.01.2020";
    const result = getOverriddenDate({ date: "25.12.2025" });
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(25);
  });

  it("falls back to env var when param is undefined", () => {
    process.env.OVERRIDE_DATE = "01.01.2020";
    const result = getOverriddenDate();
    expect(result.getFullYear()).toBe(2020);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
  });

  it("throws for invalid override date", () => {
    expect(() => getOverriddenDate({ date: "invalid" })).toThrow("Failed to parse override date");
  });

  it("throws for invalid override time", () => {
    expect(() => getOverriddenDate({ date: "15.06.2026", time: "25:00" })).toThrow("Failed to parse override time");
  });
});
