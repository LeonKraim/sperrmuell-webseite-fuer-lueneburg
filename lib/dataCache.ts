import fs from "fs";
import path from "path";
import config from "../config";
import logger from "./logger";
import wasteSchedules from "../data/waste_schedules.geojson";

let cachedData: { type: string; features: unknown[] } | null = null;

export async function getGeoJsonData(): Promise<{ type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] }> {
  if (cachedData) {
    return cachedData as { type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] };
  }

  const start = Date.now();
  let parsed: { type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] };

  // Try to use imported data first (works on Vercel and build-time)
  try {
    if (wasteSchedules && typeof wasteSchedules === "object") {
      parsed = wasteSchedules as { type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] };
      const duration = Date.now() - start;
      logger.info("GeoJSON loaded from import", { featureCount: parsed.features?.length ?? 0, durationMs: duration });
      cachedData = parsed;
      return parsed;
    }
  } catch (err) {
    logger.warn("Failed to load imported GeoJSON, falling back to filesystem", { error: err });
  }

  // Fallback to filesystem read for development
  const filePath = path.resolve(process.cwd(), config.geojsonPath);
  logger.info("Loading GeoJSON file from filesystem", { path: filePath });

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    logger.error("Failed to read GeoJSON file", { error: err });
    throw new Error("data_unavailable");
  }

  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    logger.error("Failed to parse GeoJSON file", { error: err });
    throw new Error("parse_error");
  }

  const duration = Date.now() - start;
  logger.info("GeoJSON loaded from filesystem", { featureCount: parsed.features?.length ?? 0, durationMs: duration });

  cachedData = parsed;
  return parsed as { type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] };
}
