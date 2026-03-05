import fs from "fs";
import path from "path";
import config from "../config";
import logger from "./logger";

let cachedData: { type: string; features: unknown[] } | null = null;

export async function getGeoJsonData(): Promise<{ type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] }> {
  if (cachedData) {
    return cachedData as { type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] };
  }

  const start = Date.now();
  let parsed: { type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] };

  // Vercel serves the public directory as static files, so we need to read from there
  const possiblePaths = [
    // Public directory (Vercel + development)
    path.join(process.cwd(), "public/waste_schedules.geojson"),
    // Legacy data directory path (for backward compatibility)
    path.join(process.cwd(), "data/waste_schedules.geojson"),
  ];

  let raw: string | null = null;
  let successPath: string | null = null;

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        raw = fs.readFileSync(filePath, "utf-8");
        successPath = filePath;
        break;
      }
    } catch (err) {
      logger.debug?.("Failed to read from path", { path: filePath });
    }
  }

  if (!raw) {
    logger.error("Failed to read GeoJSON file from any path", { attemptedPaths: possiblePaths });
    throw new Error("data_unavailable");
  }

  logger.info("Loading GeoJSON file from filesystem", { path: successPath });

  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    logger.error("Failed to parse GeoJSON file", { error: String(err) });
    throw new Error("parse_error");
  }

  const duration = Date.now() - start;
  logger.info("GeoJSON loaded from filesystem", { featureCount: parsed.features?.length ?? 0, durationMs: duration });

  cachedData = parsed;
  return parsed as { type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] };
}
