import fs from "fs";
import path from "path";

// We need to mock fs and logger before importing dataCache
jest.mock("fs");
jest.mock("@/lib/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockedFs = jest.mocked(fs);

const validGeoJson = JSON.stringify({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [10.442, 53.277] },
      properties: {
        region: "Adendorf",
        street: "Ahornweg",
        address: "Ahornweg 1",
        waste_schedules: { "Sperrmüll": ["Di. 27.01.2026"] },
      },
    },
  ],
});

// Since dataCache uses a module-level cache variable, we need to reset modules between tests
describe("dataCache", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  async function importFresh() {
    // Re-apply mocks after resetModules
    jest.mock("fs");
    jest.mock("@/lib/logger", () => ({
      __esModule: true,
      default: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      },
    }));
    const freshFs = (await import("fs")).default;
    const mod = await import("@/lib/dataCache");
    return { getGeoJsonData: mod.getGeoJsonData, fs: jest.mocked(freshFs) };
  }

  it("reads and parses the GeoJSON file successfully", async () => {
    const { getGeoJsonData, fs: mfs } = await importFresh();
    mfs.existsSync.mockReturnValue(true);
    mfs.readFileSync.mockReturnValue(validGeoJson);

    const result = await getGeoJsonData();

    expect(result.type).toBe("FeatureCollection");
    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties.street).toBe("Ahornweg");
  });

  it("caches data after first successful read", async () => {
    const { getGeoJsonData, fs: mfs } = await importFresh();
    mfs.existsSync.mockReturnValue(true);
    mfs.readFileSync.mockReturnValue(validGeoJson);

    await getGeoJsonData();
    await getGeoJsonData();

    // readFileSync should only be called once due to caching
    expect(mfs.readFileSync).toHaveBeenCalledTimes(1);
  });

  it("throws 'data_unavailable' when file not found in any path", async () => {
    const { getGeoJsonData, fs: mfs } = await importFresh();
    mfs.existsSync.mockReturnValue(false);

    await expect(getGeoJsonData()).rejects.toThrow("data_unavailable");
  });

  it("throws 'parse_error' when file contains invalid JSON", async () => {
    const { getGeoJsonData, fs: mfs } = await importFresh();
    mfs.existsSync.mockReturnValue(true);
    mfs.readFileSync.mockReturnValue("not valid json {{{");

    await expect(getGeoJsonData()).rejects.toThrow("parse_error");
  });

  it("tries fallback path when first path fails", async () => {
    const { getGeoJsonData, fs: mfs } = await importFresh();
    // First path doesn't exist, second does
    let callCount = 0;
    mfs.existsSync.mockImplementation(() => {
      callCount++;
      return callCount > 1; // false for first, true for second
    });
    mfs.readFileSync.mockReturnValue(validGeoJson);

    const result = await getGeoJsonData();
    expect(result.features).toHaveLength(1);
  });

  it("handles existsSync throwing an error gracefully", async () => {
    const { getGeoJsonData, fs: mfs } = await importFresh();
    mfs.existsSync.mockImplementation(() => {
      throw new Error("Permission denied");
    });

    await expect(getGeoJsonData()).rejects.toThrow("data_unavailable");
  });
});
