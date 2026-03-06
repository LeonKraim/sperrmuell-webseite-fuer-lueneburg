import { put, list, get } from "@vercel/blob";

const SENT_DATES_PATH = "notify-log/sent-dates.json";
const LAST_RUN_PATH = "notify-log/last-run.json";

export interface NotifyRunLog {
  runAt: string;        // ISO timestamp of when the cron ran
  collectionDate: string; // dd.mm.yyyy — the date notifications were sent for
  sent: number;
  failed: number;
  skipped: boolean;     // true if already sent for this date (dedup)
}

async function readBlobJson<T>(pathname: string): Promise<T | null> {
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    if (!blobs.length) return null;
    const result = await get(blobs[0].pathname, { access: "private", useCache: false });
    if (!result?.stream) return null;
    return JSON.parse(await new Response(result.stream).text()) as T;
  } catch {
    return null;
  }
}

async function writeBlobJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

/** Returns true if we already dispatched push notifications for this collection date. */
export async function hasAlreadySentForDate(collectionDate: string): Promise<boolean> {
  const sent = await readBlobJson<string[]>(SENT_DATES_PATH);
  return Array.isArray(sent) && sent.includes(collectionDate);
}

/** Records a collection date as notified. Keeps only the last 30 entries. */
export async function markDateAsSent(collectionDate: string): Promise<void> {
  const sent = (await readBlobJson<string[]>(SENT_DATES_PATH)) ?? [];
  if (!sent.includes(collectionDate)) {
    await writeBlobJson(SENT_DATES_PATH, [...sent, collectionDate].slice(-30));
  }
}

/** Persists the result of a notify cron run so it can be inspected later. */
export async function writeLastRunLog(log: NotifyRunLog): Promise<void> {
  await writeBlobJson(LAST_RUN_PATH, log);
}

/** Returns the last recorded notify run, or null if it has never run. */
export async function readLastRunLog(): Promise<NotifyRunLog | null> {
  return readBlobJson<NotifyRunLog>(LAST_RUN_PATH);
}
