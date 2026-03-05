import { filterByDate, haversineDistance, sortByDistance } from "@/lib/geojson";

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
});

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

  it("handles null input gracefully", () => {
    expect(haversineDistance(null, null, 53.28, 10.46)).toBe(Infinity);
  });
});

describe("sortByDistance", () => {
  const features = [
    { type: "Feature" as const, geometry: { type: "Point", coordinates: [10.46, 53.28] }, properties: { street: "Z", region: "", address: "", matchedScheduleTypes: [] } },
    { type: "Feature" as const, geometry: { type: "Point", coordinates: [10.0, 53.0] }, properties: { street: "A", region: "", address: "", matchedScheduleTypes: [] } },
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
  });
});
