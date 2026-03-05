import { NextRequest, NextResponse } from "next/server";
import { getGeoJsonData } from "@/lib/dataCache";
import { filterByDate } from "@/lib/geojson";
import { todayAsGermanDateString } from "@/lib/dateUtils";
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
    const data = await getGeoJsonData();
    const todayStr = todayAsGermanDateString();

    logger.info("Filtering by date", { dateString: todayStr });
    const filtered = filterByDate(data, todayStr);

    logger.info("API today response", {
      ipHash,
      featureCount: filtered.features.length,
      durationMs: Date.now() - start,
      status: 200,
    });

    return NextResponse.json(filtered, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    const errorCode =
      err instanceof Error && (err.message === "data_unavailable" || err.message === "parse_error")
        ? err.message
        : "internal_error";

    logger.error("API today error", { error: err, ipHash, durationMs: Date.now() - start });

    return NextResponse.json({ error: errorCode }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: "method_not_allowed" }, { status: 405 });
}
