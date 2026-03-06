import { toGeoJSON, toKML, toGPX, toCSV, UnsupportedFormatError, serializeExport } from "@/lib/exportFormats";
import type { WasteFeatureCollection } from "@/lib/geojson";

// ───────────── Test Data ─────────────

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

const specialCharsCollection: WasteFeatureCollection = {
  type: "FeatureCollection",
  date: "2026-01-27",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [10.0, 53.0] },
      properties: {
        region: "Lüne<burg>",
        street: 'Straße & "Weg"',
        address: "Müllerstr. 5, <Test> & 'City'",
        matchedScheduleTypes: ["Sperrmüll"],
      },
    },
  ],
};

const commaInFieldCollection: WasteFeatureCollection = {
  type: "FeatureCollection",
  date: "2026-01-27",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [10.0, 53.0] },
      properties: {
        region: "Region, with comma",
        street: 'Street "with" quotes',
        address: "Line1\nLine2",
        matchedScheduleTypes: ["Type A", "Type B"],
      },
    },
  ],
};

// ───────────── toGeoJSON ─────────────

describe("toGeoJSON", () => {
  it("produces valid FeatureCollection JSON", () => {
    const result = JSON.parse(toGeoJSON(sampleCollection));
    expect(result.type).toBe("FeatureCollection");
    expect(result.features).toHaveLength(2);
  });

  it("preserves all feature data", () => {
    const result = JSON.parse(toGeoJSON(sampleCollection));
    expect(result.features[0].properties.street).toBe("Ahornweg");
    expect(result.features[0].geometry.coordinates).toEqual([10.442, 53.277]);
  });

  it("handles empty collection", () => {
    const result = JSON.parse(toGeoJSON(emptyCollection));
    expect(result.features).toHaveLength(0);
  });

  it("output is pretty-printed (indented)", () => {
    const result = toGeoJSON(sampleCollection);
    expect(result).toContain("\n");
    expect(result).toContain("  ");
  });

  it("is valid JSON (round-trips)", () => {
    const result = toGeoJSON(sampleCollection);
    expect(() => JSON.parse(result)).not.toThrow();
  });
});

// ───────────── toKML ─────────────

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

  it("includes dateStr in document name", () => {
    const result = toKML(sampleCollection, "27.01.2026");
    expect(result).toContain("27.01.2026");
  });

  it("escapes XML special characters", () => {
    const result = toKML(specialCharsCollection, "27.01.2026");
    expect(result).toContain("&amp;");
    expect(result).toContain("&lt;");
    expect(result).toContain("&gt;");
    expect(result).toContain("&quot;");
  });

  it("contains coordinates in correct format", () => {
    const result = toKML(sampleCollection, "27.01.2026");
    expect(result).toContain("10.442,53.277,0");
  });

  it("handles empty collection", () => {
    const result = toKML(emptyCollection, "27.01.2026");
    expect(result).toContain("<Document>");
    expect(result).not.toContain("<Placemark>");
  });

  it("wraps each feature in a Placemark", () => {
    const result = toKML(sampleCollection, "27.01.2026");
    const placemarkCount = (result.match(/<Placemark>/g) || []).length;
    expect(placemarkCount).toBe(2);
  });
});

// ───────────── toGPX ─────────────

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

  it("escapes XML in names", () => {
    const result = toGPX(specialCharsCollection);
    expect(result).toContain("&amp;");
    expect(result).toContain("&quot;");
  });

  it("handles empty collection", () => {
    const result = toGPX(emptyCollection);
    expect(result).toContain("<gpx");
    expect(result).not.toContain("<wpt");
  });

  it("each feature produces a waypoint", () => {
    const result = toGPX(sampleCollection);
    const wptCount = (result.match(/<wpt/g) || []).length;
    expect(wptCount).toBe(2);
  });

  it("includes street as name and address as desc", () => {
    const result = toGPX(sampleCollection);
    expect(result).toContain("<name>Ahornweg</name>");
    expect(result).toContain("<desc>Ahornweg 1, 21365 Adendorf</desc>");
  });
});

// ───────────── toCSV ─────────────

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
    expect(lines).toHaveLength(1);
  });

  it("quotes fields containing commas", () => {
    const result = toCSV(commaInFieldCollection);
    expect(result).toContain('"Region, with comma"');
  });

  it("escapes double quotes inside fields", () => {
    const result = toCSV(commaInFieldCollection);
    expect(result).toContain('""with""');
  });

  it("quotes fields containing newlines", () => {
    const result = toCSV(commaInFieldCollection);
    expect(result).toContain('"Line1\nLine2"');
  });

  it("includes correct number of data rows", () => {
    const result = toCSV(sampleCollection);
    const lines = result.replace("\uFEFF", "").split("\n").filter(Boolean);
    expect(lines).toHaveLength(3); // header + 2 data rows
  });

  it("includes lat/lng in correct order", () => {
    const result = toCSV(sampleCollection);
    // latitude (53.277) before longitude (10.442)
    expect(result).toContain("53.277,10.442");
  });
});

// ───────────── serializeExport ─────────────

describe("serializeExport", () => {
  it("throws UnsupportedFormatError for unknown format", () => {
    expect(() => serializeExport(sampleCollection, "shapefile", "2026-01-27")).toThrow(UnsupportedFormatError);
  });

  it("returns correct content type for geojson", () => {
    const result = serializeExport(sampleCollection, "geojson", "27.01.2026");
    expect(result.contentType).toBe("application/geo+json");
    expect(result.extension).toBe("geojson");
  });

  it("returns correct content type for kml", () => {
    const result = serializeExport(sampleCollection, "kml", "27.01.2026");
    expect(result.contentType).toBe("application/vnd.google-earth.kml+xml");
    expect(result.extension).toBe("kml");
  });

  it("returns correct content type for gpx", () => {
    const result = serializeExport(sampleCollection, "gpx", "27.01.2026");
    expect(result.contentType).toBe("application/gpx+xml");
    expect(result.extension).toBe("gpx");
  });

  it("returns correct content type for csv", () => {
    const result = serializeExport(sampleCollection, "csv", "27.01.2026");
    expect(result.contentType).toBe("text/csv; charset=utf-8");
    expect(result.extension).toBe("csv");
  });

  it("is case-insensitive for format", () => {
    const result = serializeExport(sampleCollection, "GeoJSON", "27.01.2026");
    expect(result.extension).toBe("geojson");
  });

  it("content is non-empty for all formats", () => {
    for (const fmt of ["geojson", "kml", "gpx", "csv"]) {
      const result = serializeExport(sampleCollection, fmt, "27.01.2026");
      expect(result.content.length).toBeGreaterThan(0);
    }
  });

  it("UnsupportedFormatError has correct name", () => {
    try {
      serializeExport(sampleCollection, "xyz", "27.01.2026");
    } catch (e) {
      expect(e).toBeInstanceOf(UnsupportedFormatError);
      expect((e as UnsupportedFormatError).name).toBe("UnsupportedFormatError");
    }
  });
});
