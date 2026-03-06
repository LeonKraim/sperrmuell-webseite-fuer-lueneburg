import { put, list, get } from "@vercel/blob";
import type { PushSubscription } from "web-push";

const BLOB_PATHNAME = "subscriptions/subscriptions.json";

export async function readSubscriptions(): Promise<PushSubscription[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    if (blobs.length === 0) return [];
    const result = await get(blobs[0].pathname, { access: "private", useCache: false });
    if (!result || !result.stream) return [];
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as PushSubscription[];
  } catch {
    return [];
  }
}

export async function writeSubscriptions(subs: PushSubscription[]): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(subs, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function addSubscription(sub: PushSubscription): Promise<void> {
  const subs = await readSubscriptions();
  const exists = subs.some((s) => s.endpoint === sub.endpoint);
  if (!exists) {
    subs.push(sub);
    await writeSubscriptions(subs);
  }
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const subs = await readSubscriptions();
  const filtered = subs.filter((s) => s.endpoint !== endpoint);
  await writeSubscriptions(filtered);
}
