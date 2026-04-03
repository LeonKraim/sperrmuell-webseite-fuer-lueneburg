import { NextRequest, NextResponse } from "next/server";
import { addEmailSub } from "@/lib/emailSubscriptions";
import { sendEmail } from "@/lib/mailer";
import { buildConfirmationEmail } from "@/lib/emailTemplates";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import logger from "@/lib/logger";
import config from "@/config";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "rate_limit_exceeded" }, { status: 429 });
  }

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    config.productionUrl;

  try {
    const token = await addEmailSub(email, ip);
    const { subject, html } = buildConfirmationEmail(token, baseUrl);
    await sendEmail(email, subject, html);
    logger.info("Email confirmation sent", { email: email.slice(0, 4) + "***" });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    logger.error("Failed to process email subscription", { error: String(err) });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "rate_limit_exceeded" }, { status: 429 });
  }

  let body: { token?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const token = typeof body?.token === "string" ? body.token : "";
  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  try {
    const { removeEmailSubByToken } = await import("@/lib/emailSubscriptions");
    const removed = await removeEmailSubByToken(token);
    if (!removed) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to unsubscribe email", { error: String(err) });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
