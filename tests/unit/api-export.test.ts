/**
 * Tests for API route: /api/export
 */

import { NextRequest } from "next/server";

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

import { GET } from "@/app/api/export/route";
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

function createRequest(params = ""): NextRequest {
  const url = `http://localhost:3000/api/export${params ? `?${params}` : ""}`;
  return new NextRequest(url);
}

describe("GET /api/export", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetGeoJsonData.mockResolvedValue(sampleData as ReturnType<typeof getGeoJsonData> extends Promise<infer T> ? T : never);
    mockedCheckRateLimit.mockReturnValue(true);
  });

  it("returns 200 with default format (geojson)", async () => {
    const response = await GET(createRequest("overrideDate=27.01.2026&overrideTime=05:00"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/geo+json");
  });

  it("returns geojson format when requested", async () => {
    const response = await GET(createRequest("format=geojson&overrideDate=27.01.2026&overrideTime=05:00"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/geo+json");
  });

  it("returns kml format when requested", async () => {
    const response = await GET(createRequest("format=kml&overrideDate=27.01.2026&overrideTime=05:00"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/vnd.google-earth.kml+xml");
  });

  it("returns gpx format when requested", async () => {
    const response = await GET(createRequest("format=gpx&overrideDate=27.01.2026&overrideTime=05:00"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/gpx+xml");
  });

  it("returns csv format when requested", async () => {
    const response = await GET(createRequest("format=csv&overrideDate=27.01.2026&overrideTime=05:00"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
  });

  it("is case-insensitive for format parameter", async () => {
    const response = await GET(createRequest("format=CSV&overrideDate=27.01.2026&overrideTime=05:00"));
    expect(response.status).toBe(200);
  });

  it("returns 400 for unsupported format", async () => {
    const response = await GET(createRequest("format=shapefile"));
    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error).toBe("unsupported_format");
    expect(json.allowed).toBeDefined();
  });

  it("includes Content-Disposition header with filename", async () => {
    const response = await GET(createRequest("format=geojson&overrideDate=27.01.2026&overrideTime=05:00"));
    const disposition = response.headers.get("Content-Disposition");
    expect(disposition).toContain("attachment");
    expect(disposition).toContain(".geojson");
  });

  it("sets Cache-Control to no-store", async () => {
    const response = await GET(createRequest("overrideDate=27.01.2026&overrideTime=05:00"));
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("exports the explicitly selected date instead of the default current date", async () => {
    const response = await GET(createRequest("format=geojson&overrideDate=27.01.2026&overrideTime=05:00&selectedDate=26.01.2026"));
    const content = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain("sperrmuell_today_26.01.2026.geojson");
    expect(content).toContain('"features": []');
  });

  it("uses the actual collection date in the filename after the 06:30 cutoff", async () => {
    const response = await GET(createRequest("format=geojson&overrideDate=27.01.2026&overrideTime=07:00"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain("sperrmuell_today_28.01.2026.geojson");
  });

  it("returns 429 when rate limited", async () => {
    mockedCheckRateLimit.mockReturnValue(false);
    const response = await GET(createRequest());
    const json = await response.json();
    expect(response.status).toBe(429);
    expect(json.error).toBe("rate_limit_exceeded");
  });

  it("returns 500 when data load fails", async () => {
    mockedGetGeoJsonData.mockRejectedValue(new Error("data_unavailable"));
    const response = await GET(createRequest("overrideDate=27.01.2026&overrideTime=05:00"));
    const json = await response.json();
    expect(response.status).toBe(500);
    expect(json.error).toBe("export_failed");
  });
});
