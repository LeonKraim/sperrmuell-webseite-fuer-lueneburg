import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, stack, userAgent, timestamp } = body;

    logger.log({
      level: level || "error",
      message: `[CLIENT] ${message}`,
      stack,
      userAgent,
      timestamp,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
