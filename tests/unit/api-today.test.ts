/**
 * Tests for API route: /api/today
 * Mocks all dependencies to test the route handler in isolation.
 */

import { NextRequest } from "next/server";

// Mocks must be set up before imports
jest.mock("@/lib/dataCache", () => ({
  getGeoJsonData: jest.fn(),
}));

jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn().mockReturnValue(true),
  getClientIp: jest.fn().mockReturnValue("127.0.0.1"),
}));

jest.mock("@/lib/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { GET, POST } from "@/app/api/today/route";
import { getGeoJsonData } from "@/lib/dataCache";
import { checkRateLimit } from "@/lib/rateLimit";

const mockedGetGeoJsonData = getGeoJsonData as jest.MockedFunction<typeof getGeoJsonData>;
const mockedCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

const sampleData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [10.442, 53.277] },
      properties: {
        region: "Adendorf",
        street: "Ahornweg",
        address: "Ahornweg 1",
        waste_schedules: {
          "Sperrmüll": ["Di. 27.01.2026"],
        },
      },
    },
  ],
};

function createRequest(url = "http://localhost:3000/api/today"): NextRequest {
  return new NextRequest(url);
}

describe("GET /api/today", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetGeoJsonData.mockResolvedValue(sampleData as ReturnType<typeof getGeoJsonData> extends Promise<infer T> ? T : never);
    mockedCheckRateLimit.mockReturnValue(true);
  });

  it("returns 200 with FeatureCollection", async () => {
    const response = await GET(createRequest());
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.type).toBe("FeatureCollection");
  });

  it("returns features array", async () => {
    const response = await GET(createRequest());
    const json = await response.json();
    expect(Array.isArray(json.features)).toBe(true);
  });

  it("returns filterDate in response", async () => {
    const response = await GET(createRequest());
    const json = await response.json();
    expect(json.filterDate).toBeDefined();
    expect(typeof json.filterDate).toBe("string");
  });

  it("returns nextCollectionDate in response", async () => {
    const response = await GET(createRequest("http://localhost:3000/api/today?selectedDate=26.01.2026"));
    const json = await response.json();
    expect(json.nextCollectionDate).toBe("Di. 27.01.2026");
  });

  it("sets Cache-Control to no-store", async () => {
    const response = await GET(createRequest());
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 429 when rate limited", async () => {
    mockedCheckRateLimit.mockReturnValue(false);
    const response = await GET(createRequest());
    const json = await response.json();
    expect(response.status).toBe(429);
    expect(json.error).toBe("rate_limit_exceeded");
  });

  it("returns 500 when data is unavailable", async () => {
    mockedGetGeoJsonData.mockRejectedValue(new Error("data_unavailable"));
    const response = await GET(createRequest());
    const json = await response.json();
    expect(response.status).toBe(500);
    expect(json.error).toBe("data_unavailable");
  });

  it("returns 500 with parse_error on parse failure", async () => {
    mockedGetGeoJsonData.mockRejectedValue(new Error("parse_error"));
    const response = await GET(createRequest());
    const json = await response.json();
    expect(response.status).toBe(500);
    expect(json.error).toBe("parse_error");
  });

  it("returns 500 with internal_error for unknown errors", async () => {
    mockedGetGeoJsonData.mockRejectedValue(new Error("something unexpected"));
    const response = await GET(createRequest());
    const json = await response.json();
    expect(response.status).toBe(500);
    expect(json.error).toBe("internal_error");
  });

  it("passes override params through URL", async () => {
    const response = await GET(
      createRequest("http://localhost:3000/api/today?overrideDate=27.01.2026&overrideTime=05:00")
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    // With override date Jan 27 2026 at 05:00 (before 06:30), should filter for Jan 27
    expect(json.features).toBeDefined();
  });

  it("filters by an explicitly selected date", async () => {
    const response = await GET(createRequest("http://localhost:3000/api/today?selectedDate=26.01.2026"));
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.filterDate).toBe("Mo. 26.01.2026");
    expect(json.features).toEqual([]);
  });
});

describe("POST /api/today", () => {
  it("returns 405 Method Not Allowed", async () => {
    const response = await POST();
    const json = await response.json();
    expect(response.status).toBe(405);
    expect(json.error).toBe("method_not_allowed");
  });
});
