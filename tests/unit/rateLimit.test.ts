import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// ───────────── checkRateLimit ─────────────

describe("checkRateLimit", () => {
  // Use unique IPs per test to avoid cross-test pollution
  let testIpCounter = 0;
  const uniqueIp = () => `rate-limit-test-${++testIpCounter}-${Date.now()}`;

  it("allows first request from a new IP", () => {
    expect(checkRateLimit(uniqueIp())).toBe(true);
  });

  it("allows multiple requests under the limit", () => {
    const ip = uniqueIp();
    for (let i = 0; i < 59; i++) {
      expect(checkRateLimit(ip)).toBe(true);
    }
  });

  it("allows exactly 60 requests", () => {
    const ip = uniqueIp();
    for (let i = 0; i < 60; i++) {
      expect(checkRateLimit(ip)).toBe(true);
    }
  });

  it("blocks the 61st request", () => {
    const ip = uniqueIp();
    for (let i = 0; i < 60; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip)).toBe(false);
  });

  it("different IPs have independent limits", () => {
    const ip1 = uniqueIp();
    const ip2 = uniqueIp();
    // Exhaust ip1
    for (let i = 0; i < 60; i++) checkRateLimit(ip1);
    expect(checkRateLimit(ip1)).toBe(false);
    // ip2 should still be allowed
    expect(checkRateLimit(ip2)).toBe(true);
  });

  it("handles empty string IP", () => {
    const ip = "";
    expect(checkRateLimit(ip)).toBe(true);
  });
});

// ───────────── getClientIp ─────────────

describe("getClientIp", () => {
  function makeRequest(headers: Record<string, string>): Request {
    return {
      headers: {
        get(name: string) {
          return headers[name.toLowerCase()] ?? null;
        },
      },
    } as unknown as Request;
  }

  it("extracts IP from x-forwarded-for header", () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4" });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("extracts first IP from comma-separated x-forwarded-for", () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8, 9.10.11.12" });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("trims whitespace from IP", () => {
    const req = makeRequest({ "x-forwarded-for": "  1.2.3.4  " });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it('returns "unknown" when no x-forwarded-for header', () => {
    const req = makeRequest({});
    expect(getClientIp(req)).toBe("unknown");
  });

  it("handles IPv6 addresses", () => {
    const req = makeRequest({ "x-forwarded-for": "::1" });
    expect(getClientIp(req)).toBe("::1");
  });
});
