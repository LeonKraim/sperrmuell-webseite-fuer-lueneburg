import {
  parseGermanDate,
  todayAsGermanDateString,
  isToday,
  formatAsGermanDate,
  ParseError,
} from "@/lib/dateUtils";

describe("parseGermanDate", () => {
  it('parses "Di. 27.01.2026" correctly', () => {
    const d = parseGermanDate("Di. 27.01.2026");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0); // January
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

  it("throws ParseError on invalid format", () => {
    expect(() => parseGermanDate("XX. 99.99.9999")).toThrow(ParseError);
  });

  it("throws TypeError on null", () => {
    expect(() => parseGermanDate(null as unknown as string)).toThrow(TypeError);
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
});

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
});

describe("todayAsGermanDateString", () => {
  it("produces correct format", () => {
    const result = todayAsGermanDateString();
    expect(result).toMatch(/^(Mo\.|Di\.|Mi\.|Do\.|Fr\.|Sa\.|So\.)\s+\d{2}\.\d{2}\.\d{4}$/);
  });
});
