import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { readSubscriptions, removeSubscription } from "@/lib/subscriptions";
import { getConfirmedEmailSubs, pruneExpiredUnconfirmed } from "@/lib/emailSubscriptions";
import { sendEmail } from "@/lib/mailer";
import { buildNotificationEmail } from "@/lib/emailTemplates";
import { getGeoJsonData } from "@/lib/dataCache";
import { parseGermanDate, getNextCollectionDateFromData } from "@/lib/dateUtils";
import { hasAlreadySentForDate, markDateAsSent, writeLastRunLog } from "@/lib/notifyLog";
import logger from "@/lib/logger";

// This route is called by a cron job each morning.
// It sends push notifications to all subscribers whose area has a Sperrmüll
// collection tomorrow (so they are notified the day before).
export async function GET(request: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  // Protect with a simple secret so only the cron caller can trigger it
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // In development, ?force=true triggers an immediate test notification skipping the
  // "is there a collection tomorrow?" check. This is only honoured outside production.
  const { searchParams } = new URL(request.url);
  const isDev = process.env.NODE_ENV !== "production";
  const force = isDev && searchParams.get("force") === "true";

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dd = String(tomorrow.getDate()).padStart(2, "0");
  const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const yyyy = String(tomorrow.getFullYear());
  const tomorrowStr = `${dd}.${mm}.${yyyy}`;

  let data: Awaited<ReturnType<typeof getGeoJsonData>>;
  try {
    data = await getGeoJsonData();
  } catch {
    return NextResponse.json({ error: "data_unavailable" }, { status: 500 });
  }

  // Check if any collection happens tomorrow (skipped when force=true in dev)
  if (!force) {
    const hasTomorrow = data.features.some((f) => {
      const schedules = f.properties?.waste_schedules as Record<string, string[]> | undefined;
      if (!schedules) return false;
      return Object.values(schedules).some((dates) =>
        Array.isArray(dates) &&
        dates.some((d) => {
          try { return parseGermanDate(d).toDateString() === tomorrow.toDateString(); } catch { return false; }
        })
      );
    });

    if (!hasTomorrow) {
      logger.info("No collections tomorrow, skipping notifications", { tomorrow: tomorrowStr });
      return NextResponse.json({ sent: 0, reason: "no_collections_tomorrow" });
    }

    // Deduplication: if this cron already ran successfully for tomorrow's date
    // (e.g. a retry or double-fire), skip to avoid spamming subscribers.
    const alreadySent = await hasAlreadySentForDate(tomorrowStr);
    if (alreadySent) {
      logger.info("Already sent notifications for this date, skipping", { date: tomorrowStr });
      await writeLastRunLog({ runAt: new Date().toISOString(), collectionDate: tomorrowStr, sent: 0, failed: 0, skipped: true });
      return NextResponse.json({ sent: 0, reason: "already_sent_for_date" });
    }
  }

  const subscriptions = await readSubscriptions();
  let sent = 0;
  const failed: string[] = [];

  // For force mode in dev, find the actual next collection date instead of just using tomorrow
  const notifyDateStr = force ? getNextCollectionDateFromData(data, tomorrowStr) : tomorrowStr;

  const payload = JSON.stringify({
    title: "Sperrmüll morgen!",
    body: `Am ${notifyDateStr} ist Sperrmüll-Abfuhr. Drücke um zu erfahren wo.`,
    url: "/",
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        // Subscription expired/gone — remove it
        await removeSubscription(sub.endpoint);
        failed.push("expired");
      } else {
        failed.push(String(err));
        logger.warn("Failed to send push", { error: String(err), endpoint: sub.endpoint.slice(0, 40) });
      }
    }
  }

  logger.info("Push notifications sent", { sent, failed: failed.length, tomorrow: tomorrowStr });

  // Send email notifications
  let emailSent = 0;
  let emailFailed = 0;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `https://${request.headers.get("x-forwarded-host") || request.headers.get("host")}`;
  const emailSubs = await getConfirmedEmailSubs();
  for (const sub of emailSubs) {
    try {
      const { subject, html } = buildNotificationEmail(notifyDateStr, sub.token, baseUrl);
      await sendEmail(sub.email, subject, html);
      emailSent++;
    } catch (err) {
      emailFailed++;
      logger.warn("Failed to send email notification", { error: String(err), email: sub.email.slice(0, 4) + "***" });
    }
  }
  logger.info("Email notifications sent", { emailSent, emailFailed });

  // Prune unconfirmed expired email subs while we're running
  await pruneExpiredUnconfirmed();

  // Persist run result for /api/notify-status and mark date as sent (dedup).
  if (!force) {
    if (sent > 0 || emailSent > 0) await markDateAsSent(tomorrowStr);
    await writeLastRunLog({
      runAt: new Date().toISOString(),
      collectionDate: tomorrowStr,
      sent,
      failed: failed.length,
      skipped: false,
      emailSent,
      emailFailed,
    });
  }

  return NextResponse.json({ sent, failed: failed.length, emailSent, emailFailed });
}
