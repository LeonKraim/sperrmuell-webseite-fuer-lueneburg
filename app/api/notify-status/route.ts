import { NextResponse } from "next/server";
import { readLastRunLog } from "@/lib/notifyLog";

// Public endpoint — returns the last notify cron run result.
// Bookmark this to verify the cron actually ran and delivered notifications.
// Safe to expose: contains only timestamps and counts, no subscriber data.
export async function GET() {
  const log = await readLastRunLog();
  if (!log) {
    return NextResponse.json({ status: "never_run" });
  }
  return NextResponse.json({ status: "ok", ...log });
}
