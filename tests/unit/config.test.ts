import config from "@/config";

describe("config", () => {
  it("exports a valid config object", () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe("object");
  });

  // ───────────── Map settings ─────────────

  describe("map settings", () => {
    it("has a valid geojsonPath", () => {
      expect(typeof config.geojsonPath).toBe("string");
      expect(config.geojsonPath.length).toBeGreaterThan(0);
    });

    it("has a valid tile URL with placeholders", () => {
      expect(config.mapTileUrl).toContain("{s}");
      expect(config.mapTileUrl).toContain("{z}");
      expect(config.mapTileUrl).toContain("{x}");
      expect(config.mapTileUrl).toContain("{y}");
    });

    it("has non-empty map attribution", () => {
      expect(config.mapAttribution.length).toBeGreaterThan(0);
    });

    it("has valid default center coordinates [lat, lng]", () => {
      const [lat, lng] = config.mapDefaultCenter;
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
    });

    it("has sensible zoom levels", () => {
      expect(config.mapDefaultZoom).toBeGreaterThanOrEqual(config.mapMinZoom);
      expect(config.mapDefaultZoom).toBeLessThanOrEqual(config.mapMaxZoom);
      expect(config.mapMinZoom).toBeGreaterThanOrEqual(0);
      expect(config.mapMaxZoom).toBeLessThanOrEqual(22);
    });
  });

  // ───────────── Color settings ─────────────

  describe("color settings", () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    it("todayMarkerColor is a valid hex color", () => {
      expect(config.todayMarkerColor).toMatch(hexColorRegex);
    });

    it("todayMarkerBorderColor is a valid hex color", () => {
      expect(config.todayMarkerBorderColor).toMatch(hexColorRegex);
    });

    it("userLocationColor is a valid hex color", () => {
      expect(config.userLocationColor).toMatch(hexColorRegex);
    });

    it("userLocationPulseColor is a valid hex color", () => {
      expect(config.userLocationPulseColor).toMatch(hexColorRegex);
    });

    it("streetLineColor is a valid hex color", () => {
      expect(config.streetLineColor).toMatch(hexColorRegex);
    });

    it("loadingBarColor is a valid hex color", () => {
      expect(config.loadingBarColor).toMatch(hexColorRegex);
    });
  });

  // ───────────── Street line settings ─────────────

  describe("street line settings", () => {
    it("has positive line weight", () => {
      expect(config.streetLineWeight).toBeGreaterThan(0);
    });

    it("has opacity between 0 and 1", () => {
      expect(config.streetLineOpacity).toBeGreaterThanOrEqual(0);
      expect(config.streetLineOpacity).toBeLessThanOrEqual(1);
    });
  });

  // ───────────── Sort & display settings ─────────────

  describe("sort & display settings", () => {
    it("defaultSortOrder is closest or furthest", () => {
      expect(["closest", "furthest"]).toContain(config.defaultSortOrder);
    });

    it("maxStreetsInPanel is a positive integer", () => {
      expect(Number.isInteger(config.maxStreetsInPanel)).toBe(true);
      expect(config.maxStreetsInPanel).toBeGreaterThan(0);
    });
  });

  // ───────────── Export settings ─────────────

  describe("export settings", () => {
    it("has at least one export format", () => {
      expect(config.exportFormats.length).toBeGreaterThan(0);
    });

    it("all export formats are lowercase strings", () => {
      config.exportFormats.forEach((fmt) => {
        expect(typeof fmt).toBe("string");
        expect(fmt).toBe(fmt.toLowerCase());
      });
    });

    it("includes expected formats", () => {
      expect(config.exportFormats).toContain("geojson");
      expect(config.exportFormats).toContain("kml");
      expect(config.exportFormats).toContain("gpx");
      expect(config.exportFormats).toContain("csv");
    });

    it("default format is in the allowed list", () => {
      const allowed: readonly string[] = config.exportFormats;
      expect(allowed).toContain(config.exportDefaultFormat);
    });

    it("has a non-empty filename prefix", () => {
      expect(config.exportFilenamePrefix.length).toBeGreaterThan(0);
    });
  });

  // ───────────── Ad settings ─────────────

  describe("ad settings", () => {
    it("adsEnabled is boolean", () => {
      expect(typeof config.adsEnabled).toBe("boolean");
    });

    it("adSidebarsEnabled is boolean", () => {
      expect(typeof config.adSidebarsEnabled).toBe("boolean");
    });

    it("ad slots are strings", () => {
      expect(typeof config.adSlotLeft).toBe("string");
      expect(typeof config.adSlotRight).toBe("string");
    });

    it("adBannerWidthPx is a positive number", () => {
      expect(config.adBannerWidthPx).toBeGreaterThan(0);
    });
  });

  // ───────────── Logging settings ─────────────

  describe("logging settings", () => {
    it("logLevel is a valid level", () => {
      expect(["debug", "info", "warn", "error"]).toContain(config.logLevel);
    });

    it("logFilePath is a non-empty string", () => {
      expect(config.logFilePath.length).toBeGreaterThan(0);
    });

    it("logMaxSizeMb is positive", () => {
      expect(config.logMaxSizeMb).toBeGreaterThan(0);
    });

    it("logMaxFiles is positive", () => {
      expect(config.logMaxFiles).toBeGreaterThan(0);
    });
  });

  // ───────────── Loading bar settings ─────────────

  describe("loading bar settings", () => {
    it("loadingBarHeight is a valid CSS value", () => {
      expect(config.loadingBarHeight).toMatch(/^\d+px$/);
    });
  });
});
