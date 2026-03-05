const EXPORT_FORMATS = ["geojson", "kml", "gpx", "csv"] as const;
type ExportFormat = (typeof EXPORT_FORMATS)[number];

const config = {
  geojsonPath: "./data/waste_schedules.geojson",
  mapTileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  mapAttribution: "© OpenStreetMap contributors",
  mapDefaultCenter: [53.72, 10.19] as [number, number],
  mapDefaultZoom: 9,
  mapMinZoom: 8,
  mapMaxZoom: 19,
  todayMarkerColor: "#E63946",
  todayMarkerBorderColor: "#FFFFFF",
  userLocationColor: "#1D3557",
  userLocationPulseColor: "#457B9D",
  streetLineColor: "#E63946",
  streetLineWeight: 4,
  streetLineOpacity: 0.85,
  defaultSortOrder: "closest" as "closest" | "furthest",
  maxStreetsInPanel: 500,
  exportFormats: EXPORT_FORMATS,
  exportDefaultFormat: "geojson" as ExportFormat,
  exportFilenamePrefix: "sperrmuell_today",
  adsEnabled: false,
  adSidebarsEnabled: false,
  adSlotLeft: "1234567890",
  adSlotRight: "0987654321",
  adBannerWidthPx: 160,
  loadingBarColor: "#E63946",
  loadingBarHeight: "3px",
  logLevel: "info" as "debug" | "info" | "warn" | "error",
  logFilePath: "./logs/app.log",
  logMaxSizeMb: 20,
  logMaxFiles: 5,
};

export default config;
