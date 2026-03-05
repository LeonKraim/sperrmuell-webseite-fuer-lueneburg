import fs from "fs";
import path from "path";
import config from "../config";
import logger from "./logger";

let cachedData: { type: string; features: unknown[] } | null = null;

export async function getGeoJsonData(): Promise<{ type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] }> {
  if (cachedData) {
    return cachedData as { type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] };
  }

  const filePath = path.resolve(process.cwd(), config.geojsonPath);
  logger.info("Loading GeoJSON file", { path: filePath });

  const start = Date.now();
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    logger.error("Failed to read GeoJSON file", { error: err });
    throw new Error("data_unavailable");
  }

  let parsed: { type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] };
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    logger.error("Failed to parse GeoJSON file", { error: err });
    throw new Error("parse_error");
  }

  const duration = Date.now() - start;
  logger.info("GeoJSON loaded", { featureCount: parsed.features?.length ?? 0, durationMs: duration });

  cachedData = parsed;
  return parsed as { type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] };
}
