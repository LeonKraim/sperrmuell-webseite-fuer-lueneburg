import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { readSubscriptions, removeSubscription } from "@/lib/subscriptions";
import { getGeoJsonData } from "@/lib/dataCache";
import { parseGermanDate } from "@/lib/dateUtils";
import logger from "@/lib/logger";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// This route is called by a cron job each morning.
// It sends push notifications to all subscribers whose area has a Sperrmüll
// collection tomorrow (so they are notified the day before).
export async function GET(request: NextRequest) {
  // Protect with a simple secret so only the cron caller can trigger it
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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

  // Check if any collection happens tomorrow
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

  const subscriptions = readSubscriptions();
  let sent = 0;
  const failed: string[] = [];

  const payload = JSON.stringify({
    title: "Sperrmüll morgen!",
    body: `Am ${tomorrowStr} ist Sperrmüll-Abfuhr. Jetzt überprüfen wo in deiner Nähe.`,
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
        removeSubscription(sub.endpoint);
        failed.push("expired");
      } else {
        failed.push(String(err));
        logger.warn("Failed to send push", { error: String(err), endpoint: sub.endpoint.slice(0, 40) });
      }
    }
  }

  logger.info("Push notifications sent", { sent, failed: failed.length, tomorrow: tomorrowStr });
  return NextResponse.json({ sent, failed: failed.length });
}
