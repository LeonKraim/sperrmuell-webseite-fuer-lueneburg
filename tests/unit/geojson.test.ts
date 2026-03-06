import { filterByDate, haversineDistance, sortByDistance, WasteFeature } from "@/lib/geojson";

// ───────────── Test Data ─────────────

const sampleFeatures = [
  {
    type: "Feature" as const,
    geometry: { type: "Point", coordinates: [10.442, 53.277] },
    properties: {
      region: "Adendorf",
      street: "Ahornweg",
      address: "Ahornweg 1, 21365 Adendorf",
      waste_schedules: {
        "Sperrmüll": ["Di. 27.01.2026"],
        "Restmüll": ["Mo. 02.02.2026"],
      },
    },
  },
  {
    type: "Feature" as const,
    geometry: { type: "Point", coordinates: [10.455, 53.285] },
    properties: {
      region: "Adendorf",
      street: "Berliner Allee",
      address: "Berliner Allee 5, 21365 Adendorf",
      waste_schedules: {
        "Biotonne": ["Di. 27.01.2026"],
      },
    },
  },
];

const sampleCollection = { type: "FeatureCollection", features: sampleFeatures };

// ───────────── filterByDate ─────────────

describe("filterByDate", () => {
  it("returns only features matching given date", () => {
    const result = filterByDate(sampleCollection, "Di. 27.01.2026");
    expect(result.features).toHaveLength(2);
  });

  it("returns empty FeatureCollection if no match", () => {
    const result = filterByDate(sampleCollection, "Mo. 01.01.2030");
    expect(result.features).toHaveLength(0);
    expect(result.type).toBe("FeatureCollection");
  });

  it("handles features with multiple schedule types", () => {
    const result = filterByDate(sampleCollection, "Di. 27.01.2026");
    const ahornweg = result.features.find((f) => f.properties.street === "Ahornweg");
    expect(ahornweg?.properties.matchedScheduleTypes).toContain("Sperrmüll");
  });

  it("only matches the specific schedule type for the date", () => {
    const result = filterByDate(sampleCollection, "Di. 27.01.2026");
    const ahornweg = result.features.find((f) => f.properties.street === "Ahornweg");
    expect(ahornweg?.properties.matchedScheduleTypes).toEqual(["Sperrmüll"]);
    expect(ahornweg?.properties.matchedScheduleTypes).not.toContain("Restmüll");
  });

  it("matches Restmüll on its own date", () => {
    const result = filterByDate(sampleCollection, "Mo. 02.02.2026");
    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties.street).toBe("Ahornweg");
    expect(result.features[0].properties.matchedScheduleTypes).toEqual(["Restmüll"]);
  });

  it("handles features with empty waste_schedules", () => {
    const col = {
      type: "FeatureCollection",
      features: [{ type: "Feature" as const, geometry: { type: "Point", coordinates: [0, 0] }, properties: { waste_schedules: {}, street: "A", region: "B", address: "C" } }],
    };
    const result = filterByDate(col, "Di. 27.01.2026");
    expect(result.features).toHaveLength(0);
  });

  it("handles features with missing waste_schedules key", () => {
    const col = {
      type: "FeatureCollection",
      features: [{ type: "Feature" as const, geometry: { type: "Point", coordinates: [0, 0] }, properties: { street: "A", region: "B", address: "C" } }],
    };
    const result = filterByDate(col, "Di. 27.01.2026");
    expect(result.features).toHaveLength(0);
  });

  it("handles features with waste_schedules set to non-object", () => {
    const col = {
      type: "FeatureCollection",
      features: [{ type: "Feature" as const, geometry: { type: "Point", coordinates: [0, 0] }, properties: { waste_schedules: "invalid", street: "A", region: "B", address: "C" } }],
    };
    const result = filterByDate(col, "Di. 27.01.2026");
    expect(result.features).toHaveLength(0);
  });

  it("strips waste_schedules from response", () => {
    const result = filterByDate(sampleCollection, "Di. 27.01.2026");
    result.features.forEach((f) => {
      expect(f.properties).not.toHaveProperty("waste_schedules");
    });
  });

  it("retains matchedScheduleTypes", () => {
    const result = filterByDate(sampleCollection, "Di. 27.01.2026");
    result.features.forEach((f) => {
      expect(f.properties.matchedScheduleTypes).toBeDefined();
      expect(f.properties.matchedScheduleTypes.length).toBeGreaterThan(0);
    });
  });

  it("derives ISO date from German date string", () => {
    const result = filterByDate(sampleCollection, "Di. 27.01.2026");
    expect(result.date).toBe("2026-01-27");
  });

  it("preserves filterDate in response", () => {
    const result = filterByDate(sampleCollection, "Di. 27.01.2026");
    expect(result.filterDate).toBe("Di. 27.01.2026");
  });

  it("handles empty feature collection", () => {
    const col = { type: "FeatureCollection", features: [] };
    const result = filterByDate(col, "Di. 27.01.2026");
    expect(result.features).toHaveLength(0);
    expect(result.type).toBe("FeatureCollection");
  });

  it("handles undefined features array", () => {
    const col = { type: "FeatureCollection", features: undefined as unknown as never[] };
    const result = filterByDate(col, "Di. 27.01.2026");
    expect(result.features).toHaveLength(0);
  });

  it("defaults missing region/street/address to empty string", () => {
    const col = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: { waste_schedules: { "Type": ["Di. 27.01.2026"] } },
      }],
    };
    const result = filterByDate(col, "Di. 27.01.2026");
    expect(result.features[0].properties.region).toBe("");
    expect(result.features[0].properties.street).toBe("");
    expect(result.features[0].properties.address).toBe("");
  });

  it("preserves geometry from original feature", () => {
    const result = filterByDate(sampleCollection, "Di. 27.01.2026");
    expect(result.features[0].geometry.coordinates).toEqual([10.442, 53.277]);
  });

  it("handles feature with multiple matching schedule types", () => {
    const col = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: { type: "Point", coordinates: [10, 53] },
        properties: {
          region: "R",
          street: "S",
          address: "A",
          waste_schedules: {
            "TypeA": ["Di. 27.01.2026"],
            "TypeB": ["Di. 27.01.2026"],
            "TypeC": ["Mo. 01.01.2030"],
          },
        },
      }],
    };
    const result = filterByDate(col, "Di. 27.01.2026");
    expect(result.features[0].properties.matchedScheduleTypes).toEqual(["TypeA", "TypeB"]);
  });
});

// ───────────── haversineDistance ─────────────

describe("haversineDistance", () => {
  it("returns 0 for same point", () => {
    expect(haversineDistance(53.28, 10.46, 53.28, 10.46)).toBeCloseTo(0, 3);
  });

  it("returns approximately 254km for Berlin-Hamburg", () => {
    const dist = haversineDistance(52.52, 13.405, 53.55, 9.993);
    expect(dist).toBeGreaterThan(250);
    expect(dist).toBeLessThan(258);
  });

  it("handles coordinates across prime meridian", () => {
    const dist = haversineDistance(51.5, -0.1, 51.5, 0.1);
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(20);
  });

  it("handles null input gracefully (returns Infinity)", () => {
    expect(haversineDistance(null, null, 53.28, 10.46)).toBe(Infinity);
  });

  it("handles undefined input (returns Infinity)", () => {
    expect(haversineDistance(undefined, undefined, 53.28, 10.46)).toBe(Infinity);
  });

  it("handles partial null (lat1 null)", () => {
    expect(haversineDistance(null, 10.0, 53.28, 10.46)).toBe(Infinity);
  });

  it("handles partial null (lng2 null)", () => {
    expect(haversineDistance(53.28, 10.0, 53.28, null)).toBe(Infinity);
  });

  it("is symmetric (dist A→B == dist B→A)", () => {
    const ab = haversineDistance(52.52, 13.405, 53.55, 9.993);
    const ba = haversineDistance(53.55, 9.993, 52.52, 13.405);
    expect(ab).toBeCloseTo(ba, 6);
  });

  it("calculates approximately half Earth circumference for antipodal points", () => {
    const dist = haversineDistance(0, 0, 0, 180);
    expect(dist).toBeGreaterThan(20000);
    expect(dist).toBeLessThan(20100);
  });

  it("handles equator to pole distance", () => {
    const dist = haversineDistance(0, 0, 90, 0);
    expect(dist).toBeGreaterThan(10000);
    expect(dist).toBeLessThan(10100);
  });
});

// ───────────── sortByDistance ─────────────

describe("sortByDistance", () => {
  const features: WasteFeature[] = [
    { type: "Feature", geometry: { type: "Point", coordinates: [10.46, 53.28] }, properties: { street: "Z", region: "", address: "", matchedScheduleTypes: [] } },
    { type: "Feature", geometry: { type: "Point", coordinates: [10.0, 53.0] }, properties: { street: "A", region: "", address: "", matchedScheduleTypes: [] } },
  ];

  it("sorts closest first", () => {
    const result = sortByDistance(features, 53.28, 10.46, "closest");
    expect(result[0].properties.street).toBe("Z");
  });

  it("sorts furthest first", () => {
    const result = sortByDistance(features, 53.28, 10.46, "furthest");
    expect(result[0].properties.street).toBe("A");
  });

  it("falls back to alphabetical without user location", () => {
    const result = sortByDistance(features, null, null, "closest");
    expect(result[0].properties.street).toBe("A");
    expect(result[1].properties.street).toBe("Z");
  });

  it("falls back to alphabetical when lat is undefined", () => {
    const result = sortByDistance(features, undefined, 10.46, "closest");
    expect(result[0].properties.street).toBe("A");
  });

  it("does not mutate original array", () => {
    const original = [...features];
    sortByDistance(features, 53.28, 10.46, "closest");
    expect(features[0].properties.street).toBe(original[0].properties.street);
  });

  it("handles empty features array", () => {
    const result = sortByDistance([], 53.28, 10.46, "closest");
    expect(result).toHaveLength(0);
  });

  it("handles single feature", () => {
    const single = [features[0]];
    const result = sortByDistance(single, 53.28, 10.46, "closest");
    expect(result).toHaveLength(1);
    expect(result[0].properties.street).toBe("Z");
  });

  it("defaults order to closest", () => {
    const result = sortByDistance(features, 53.28, 10.46);
    expect(result[0].properties.street).toBe("Z");
  });
});
