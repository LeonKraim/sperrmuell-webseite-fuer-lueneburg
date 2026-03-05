import { NextRequest, NextResponse } from "next/server";
import { getGeoJsonData } from "@/lib/dataCache";
import { filterByDate } from "@/lib/geojson";
import { getGarbageCollectionDate, getGarbageCollectionDateFormatted } from "@/lib/dateUtils";
import { getOverrideFromParams } from "@/lib/dateOverride";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import logger from "@/lib/logger";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(request);
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 8);

  if (!checkRateLimit(ip)) {
    logger.warn("Rate limit exceeded", { ipHash, path: "/api/today" });
    return NextResponse.json({ error: "rate_limit_exceeded" }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const override = getOverrideFromParams(searchParams);

    const data = await getGeoJsonData();
    const collectionDateStr = getGarbageCollectionDate(override);

    logger.info("Filtering by date", { dateString: collectionDateStr });
    const filtered = filterByDate(data, collectionDateStr);
    
    // Replace filterDate with formatted version (DD.MM.YYYY with time notation)
    filtered.filterDate = getGarbageCollectionDateFormatted(override);

    logger.info("API today response", {
      ipHash,
      featureCount: filtered.features.length,
      durationMs: Date.now() - start,
      status: 200,
    });

    return NextResponse.json(filtered, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const errorCode =
      err instanceof Error && (err.message === "data_unavailable" || err.message === "parse_error")
        ? err.message
        : "internal_error";

    logger.error("API today error", { 
      error: err instanceof Error ? err.message : String(err), 
      ipHash, 
      durationMs: Date.now() - start 
    });

    return NextResponse.json({ error: errorCode }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: "method_not_allowed" }, { status: 405 });
}
