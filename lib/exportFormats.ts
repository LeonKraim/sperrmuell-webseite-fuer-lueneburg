import { WasteFeatureCollection } from "./geojson";

export class UnsupportedFormatError extends Error {
  constructor(format: string) {
    super(`Unsupported export format: "${format}"`);
    this.name = "UnsupportedFormatError";
  }
}

export function toGeoJSON(collection: WasteFeatureCollection): string {
  return JSON.stringify(collection, null, 2);
}

export function toKML(collection: WasteFeatureCollection, dateStr: string): string {
  const placemarks = collection.features
    .map((f) => {
      const { street, address, matchedScheduleTypes } = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      const desc = `${address} — ${matchedScheduleTypes.join(", ")}`;
      return `    <Placemark>
      <name>${escapeXml(street)}</name>
      <description>${escapeXml(desc)}</description>
      <Point><coordinates>${lng},${lat},0</coordinates></Point>
    </Placemark>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Waste Today ${dateStr}</name>
${placemarks}
  </Document>
</kml>`;
}

export function toGPX(collection: WasteFeatureCollection): string {
  const waypoints = collection.features
    .map((f) => {
      const { street, address } = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      return `  <wpt lat="${lat}" lon="${lng}">
    <name>${escapeXml(street)}</name>
    <desc>${escapeXml(address)}</desc>
  </wpt>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="WasteMap">
${waypoints}
</gpx>`;
}

export function toCSV(collection: WasteFeatureCollection): string {
  const BOM = "\uFEFF";
  const header = "street,region,address,matched_types,latitude,longitude\n";
  const rows = collection.features
    .map((f) => {
      const { street, region, address, matchedScheduleTypes } = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      return `${csvField(street)},${csvField(region)},${csvField(address)},${csvField(matchedScheduleTypes.join("; "))},${lat},${lng}`;
    })
    .join("\n");
  return BOM + header + rows;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function csvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function serializeExport(
  collection: WasteFeatureCollection,
  format: string,
  dateStr: string
): { content: string; contentType: string; extension: string } {
  switch (format.toLowerCase()) {
    case "geojson":
      return {
        content: toGeoJSON(collection),
        contentType: "application/geo+json",
        extension: "geojson",
      };
    case "kml":
      return {
        content: toKML(collection, dateStr),
        contentType: "application/vnd.google-earth.kml+xml",
        extension: "kml",
      };
    case "gpx":
      return {
        content: toGPX(collection),
        contentType: "application/gpx+xml",
        extension: "gpx",
      };
    case "csv":
      return {
        content: toCSV(collection),
        contentType: "text/csv; charset=utf-8",
        extension: "csv",
      };
    default:
      throw new UnsupportedFormatError(format);
  }
}
