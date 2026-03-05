import { toGeoJSON, toKML, toGPX, toCSV, UnsupportedFormatError, serializeExport } from "@/lib/exportFormats";
import type { WasteFeatureCollection } from "@/lib/geojson";

const sampleCollection: WasteFeatureCollection = {
  type: "FeatureCollection",
  date: "2026-01-27",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [10.442, 53.277] },
      properties: {
        region: "Adendorf",
        street: "Ahornweg",
        address: "Ahornweg 1, 21365 Adendorf",
        matchedScheduleTypes: ["Sperrmüll Altmetall"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [10.455, 53.285] },
      properties: {
        region: "Adendorf",
        street: "Berliner Allee",
        address: "Berliner Allee 5, 21365 Adendorf",
        matchedScheduleTypes: ["Biotonne"],
      },
    },
  ],
};

const emptyCollection: WasteFeatureCollection = {
  type: "FeatureCollection",
  date: "2026-01-27",
  features: [],
};

describe("toGeoJSON", () => {
  it("produces valid FeatureCollection JSON", () => {
    const result = JSON.parse(toGeoJSON(sampleCollection));
    expect(result.type).toBe("FeatureCollection");
    expect(result.features).toHaveLength(2);
  });
});

describe("toKML", () => {
  it("produces well-formed XML with correct namespace", () => {
    const result = toKML(sampleCollection, "2026-01-27");
    expect(result).toContain('xmlns="http://www.opengis.net/kml/2.2"');
    expect(result).toContain("<?xml");
  });

  it("includes all features", () => {
    const result = toKML(sampleCollection, "2026-01-27");
    expect(result).toContain("Ahornweg");
    expect(result).toContain("Berliner Allee");
  });
});

describe("toGPX", () => {
  it("produces valid GPX 1.1 XML", () => {
    const result = toGPX(sampleCollection);
    expect(result).toContain('version="1.1"');
    expect(result).toContain("<?xml");
  });

  it("has correct lat/lon attributes", () => {
    const result = toGPX(sampleCollection);
    expect(result).toContain('lat="53.277"');
    expect(result).toContain('lon="10.442"');
  });
});

describe("toCSV", () => {
  it("has header row", () => {
    const result = toCSV(sampleCollection);
    expect(result).toContain("street,region,address,matched_types,latitude,longitude");
  });

  it("handles special characters (umlauts)", () => {
    const result = toCSV(sampleCollection);
    expect(result).toContain("Sperrmüll");
  });

  it("produces UTF-8 BOM", () => {
    const result = toCSV(sampleCollection);
    expect(result.startsWith("\uFEFF")).toBe(true);
  });

  it("handles empty FeatureCollection → header row only", () => {
    const result = toCSV(emptyCollection);
    const lines = result.replace("\uFEFF", "").split("\n").filter(Boolean);
    expect(lines).toHaveLength(1); // header only
  });
});

describe("serializeExport", () => {
  it("throws UnsupportedFormatError for unknown format", () => {
    expect(() => serializeExport(sampleCollection, "shapefile", "2026-01-27")).toThrow(UnsupportedFormatError);
  });
});
