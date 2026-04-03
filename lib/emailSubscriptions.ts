import { put, list, get } from "@vercel/blob";
import { randomBytes } from "crypto";

const BLOB_PATHNAME = "subscriptions/email-subscribers.json";

export interface EmailSubscriber {
  email: string;
  confirmed: boolean;
  token: string;
  createdAt: string;
  signupIp: string;
  confirmedAt?: string;
  confirmIp?: string;
}

async function readEmailSubs(): Promise<EmailSubscriber[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    if (blobs.length === 0) return [];
    const result = await get(blobs[0].pathname, { access: "private", useCache: false });
    if (!result?.stream) return [];
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as EmailSubscriber[];
  } catch {
    return [];
  }
}

async function writeEmailSubs(subs: EmailSubscriber[]): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(subs, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function addEmailSub(email: string, signupIp: string): Promise<string> {
  const subs = await readEmailSubs();
  const existing = subs.find((s) => s.email === email);
  if (existing) {
    // Re-use same token so they can re-request confirmation
    return existing.token;
  }
  const token = randomBytes(32).toString("hex");
  subs.push({ email, confirmed: false, token, createdAt: new Date().toISOString(), signupIp });
  await writeEmailSubs(subs);
  return token;
}

export async function confirmEmailSub(token: string, confirmIp: string): Promise<boolean> {
  const subs = await readEmailSubs();
  const idx = subs.findIndex((s) => s.token === token);
  if (idx === -1) return false;
  subs[idx].confirmed = true;
  subs[idx].confirmedAt = new Date().toISOString();
  subs[idx].confirmIp = confirmIp;
  await writeEmailSubs(subs);
  return true;
}

export async function removeEmailSubByToken(token: string): Promise<boolean> {
  const subs = await readEmailSubs();
  const filtered = subs.filter((s) => s.token !== token);
  if (filtered.length === subs.length) return false;
  await writeEmailSubs(filtered);
  return true;
}

export async function getConfirmedEmailSubs(): Promise<EmailSubscriber[]> {
  const subs = await readEmailSubs();
  return subs.filter((s) => s.confirmed);
}

/** Prune unconfirmed subscribers older than 24 hours (called from cron). */
export async function pruneExpiredUnconfirmed(): Promise<number> {
  const subs = await readEmailSubs();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const kept = subs.filter((s) => s.confirmed || new Date(s.createdAt).getTime() > cutoff);
  const pruned = subs.length - kept.length;
  if (pruned > 0) await writeEmailSubs(kept);
  return pruned;
}
