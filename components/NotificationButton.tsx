"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";

type State = "idle" | "loading" | "subscribed" | "denied" | "unsupported";

const STORAGE_KEY = "sperrmuell-push-endpoint";

async function registerAndSubscribe(): Promise<PushSubscription> {
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const raw = atob(publicKey.replace(/-/g, "+").replace(/_/g, "/"));
  const applicationServerKey = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) applicationServerKey[i] = raw.charCodeAt(i);

  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });
}

export default function NotificationButton() {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    // Check if already subscribed
    if (localStorage.getItem(STORAGE_KEY)) {
      setState("subscribed");
    }
  }, []);

  const handleSubscribe = async () => {
    if (state === "loading") return;

    if (state === "subscribed") {
      // Unsubscribe
      setState("loading");
      try {
        const reg = await navigator.serviceWorker.getRegistration("/sw.js");
        const sub = await reg?.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await fetch("/api/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
        }
        localStorage.removeItem(STORAGE_KEY);
        setState("idle");
      } catch {
        setState("subscribed");
      }
      return;
    }

    setState("loading");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setState("denied");
      return;
    }

    try {
      const sub = await registerAndSubscribe();
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("subscribe_failed");
      localStorage.setItem(STORAGE_KEY, sub.endpoint);
      setState("subscribed");
    } catch {
      setState("idle");
    }
  };

  if (state === "unsupported") return null;

  return (
    <button
      onClick={handleSubscribe}
      disabled={state === "loading" || state === "denied"}
      className={`mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
        state === "subscribed"
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          : state === "denied"
          ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
          : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
      }`}
      title={
        state === "denied"
          ? "Benachrichtigungen wurden blockiert. Bitte Browsereinstellungen ändern."
          : undefined
      }
    >
      {state === "loading" ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : state === "subscribed" ? (
        <BellOff className="h-4 w-4" />
      ) : state === "denied" ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <BellRing className="h-4 w-4" />
      )}
      {state === "subscribed"
        ? "Benachrichtigungen deaktivieren"
        : state === "denied"
        ? "Benachrichtigungen blockiert"
        : state === "loading"
        ? "Einen Moment…"
        : "Erinnere mich vor Sperrmüll-Terminen"}
    </button>
  );
}
