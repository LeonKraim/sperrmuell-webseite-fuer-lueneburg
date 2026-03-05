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

  // Build the file path - use __dirname for server-side reliability
  // In Next.js, __dirname may need to be constructed from import.meta.url
  const isProduction = process.env.NODE_ENV === "production";
  
  // Try multiple path strategies on Vercel/production
  const possiblePaths = [
    // For production builds with bundled data
    path.join(process.cwd(), ".next/server", config.geojsonPath),
    // Root-relative path for development
    path.resolve(process.cwd(), config.geojsonPath),
    // Fallback: direct root path
    path.join(process.cwd(), config.geojsonPath),
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
      // Continue to next path
      logger.debug?.("Failed to read from path", { path: filePath, error: String(err) });
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
    logger.error("Failed to parse GeoJSON file", { error: err });
    throw new Error("parse_error");
  }

  const duration = Date.now() - start;
  logger.info("GeoJSON loaded from filesystem", { featureCount: parsed.features?.length ?? 0, durationMs: duration });

  cachedData = parsed;
  return parsed as { type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] };
}
