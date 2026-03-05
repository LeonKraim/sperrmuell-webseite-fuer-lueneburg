import { NextRequest, NextResponse } from "next/server";
import { getGeoJsonData } from "@/lib/dataCache";
import { filterByDate } from "@/lib/geojson";
import { todayAsGermanDateString } from "@/lib/dateUtils";
import { serializeExport } from "@/lib/exportFormats";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import logger from "@/lib/logger";
import crypto from "crypto";
import config from "@/config";

// Cache: cacheKey (date::format) -> serialized export
const exportCache = new Map<string, { content: string; contentType: string; extension: string }>();

function getCacheKey(date: string, format: string): string {
  return `${date}::${format}`;
}

export async function GET(request: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(request);
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 8);

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "rate_limit_exceeded" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const rawFormat = searchParams.get("format") ?? config.exportDefaultFormat;
  const format = rawFormat.toLowerCase();

  const allowedFormats: string[] = [...config.exportFormats];
  if (!allowedFormats.includes(format)) {
    return NextResponse.json(
      { error: "unsupported_format", allowed: allowedFormats },
      { status: 400 }
    );
  }

  try {
    const data = await getGeoJsonData();
    const todayStr = todayAsGermanDateString();
    const isoDate = new Date().toISOString().split("T")[0];
    const cacheKey = getCacheKey(isoDate, format);

    let content: string;
    let contentType: string;
    let extension: string;

    const cached = exportCache.get(cacheKey);
    if (cached) {
      content = cached.content;
      contentType = cached.contentType;
      extension = cached.extension;
    } else {
      const filtered = filterByDate(data, todayStr);
      const serialized = serializeExport(filtered, format, isoDate);
      content = serialized.content;
      contentType = serialized.contentType;
      extension = serialized.extension;
      exportCache.set(cacheKey, { content, contentType, extension });
    }

    const filename = `${config.exportFilenamePrefix}_${isoDate}.${extension}`;

    logger.info("Export", {
      ipHash,
      format,
      durationMs: Date.now() - start,
    });

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    logger.error("Export error", { error: err, ipHash });
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }
}
