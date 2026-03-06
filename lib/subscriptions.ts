import fs from "fs";
import path from "path";
import type { PushSubscription } from "web-push";

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), "data", "subscriptions.json");

export function readSubscriptions(): PushSubscription[] {
  try {
    const dir = path.dirname(SUBSCRIPTIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) return [];
    const raw = fs.readFileSync(SUBSCRIPTIONS_FILE, "utf-8");
    return JSON.parse(raw) as PushSubscription[];
  } catch {
    return [];
  }
}

export function writeSubscriptions(subs: PushSubscription[]): void {
  const dir = path.dirname(SUBSCRIPTIONS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), "utf-8");
}

export function addSubscription(sub: PushSubscription): void {
  const subs = readSubscriptions();
  const exists = subs.some((s) => s.endpoint === sub.endpoint);
  if (!exists) {
    subs.push(sub);
    writeSubscriptions(subs);
  }
}

export function removeSubscription(endpoint: string): void {
  const subs = readSubscriptions().filter((s) => s.endpoint !== endpoint);
  writeSubscriptions(subs);
}
