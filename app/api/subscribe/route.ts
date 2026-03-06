import { NextRequest, NextResponse } from "next/server";
import { addSubscription, removeSubscription } from "@/lib/subscriptions";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import logger from "@/lib/logger";
import type { PushSubscription } from "web-push";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "rate_limit_exceeded" }, { status: 429 });
  }

  let body: PushSubscription;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body?.endpoint || typeof body.endpoint !== "string") {
    return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });
  }

  // Validate endpoint is a real push URL (basic sanity check)
  try {
    const url = new URL(body.endpoint);
    if (!["https:"].includes(url.protocol)) {
      return NextResponse.json({ error: "invalid_endpoint" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid_endpoint" }, { status: 400 });
  }

  try {
    await addSubscription(body);
    logger.info("Push subscription added", { endpoint: body.endpoint.slice(0, 40) });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    logger.error("Failed to save subscription", { error: String(err) });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "rate_limit_exceeded" }, { status: 429 });
  }

  let body: { endpoint?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body?.endpoint || typeof body.endpoint !== "string") {
    return NextResponse.json({ error: "invalid_endpoint" }, { status: 400 });
  }

  try {
    await removeSubscription(body.endpoint);
    logger.info("Push subscription removed", { endpoint: body.endpoint.slice(0, 40) });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to remove subscription", { error: String(err) });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
