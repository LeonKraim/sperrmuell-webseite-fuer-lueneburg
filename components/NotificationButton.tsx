"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { clientLogger } from "@/lib/clientLogger";

type State = "idle" | "loading" | "subscribed" | "denied" | "unsupported" | "insecure" | "error";

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
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    clientLogger.info("[NotifBtn] init", {
      hasNotification: "Notification" in window,
      isSecureContext: window.isSecureContext,
      hasServiceWorker: "serviceWorker" in navigator,
      permission: "Notification" in window ? Notification.permission : "n/a",
    });
    if (!("Notification" in window)) {
      setState("unsupported");
      return;
    }
    // Only restore denied state if the browser explicitly says so AND we're in a secure context
    // (on HTTP LAN, browsers report permission as "denied" even when never asked)
    if (Notification.permission === "denied" && window.isSecureContext) {
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

    clientLogger.info("[NotifBtn] button clicked", {
      state,
      isSecureContext: window.isSecureContext,
      permission: Notification.permission,
      hasServiceWorker: "serviceWorker" in navigator,
    });
    setState("loading");
    setErrorMsg("");

    if (!window.isSecureContext) {
      clientLogger.info("[NotifBtn] not a secure context, aborting");
      setState("insecure");
      return;
    }

    clientLogger.info("[NotifBtn] requesting Notification permission");
    const permission = await Notification.requestPermission();
    clientLogger.info("[NotifBtn] permission result", { permission });
    if (permission !== "granted") {
      setState("denied");
      return;
    }

    try {
      clientLogger.info("[NotifBtn] registering service worker");
      const sub = await registerAndSubscribe();
      clientLogger.info("[NotifBtn] push subscription obtained", { endpoint: sub.endpoint.slice(0, 40) });
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      clientLogger.info("[NotifBtn] /api/subscribe response", { status: res.status, ok: res.ok });
      if (!res.ok) throw new Error(`subscribe_failed (HTTP ${res.status})`);
      localStorage.setItem(STORAGE_KEY, sub.endpoint);
      setState("subscribed");
      clientLogger.info("[NotifBtn] subscribed successfully");
      // In development: fire an immediate test notification so you don't have to wait for the cron
      if (process.env.NODE_ENV === "development") {
        clientLogger.info("[NotifBtn] triggering force notify for dev test");
        await new Promise((r) => setTimeout(r, 1500));
        await fetch("/api/notify?force=true");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      clientLogger.error("[NotifBtn] subscribe error: " + msg, err instanceof Error ? err : undefined);
      setErrorMsg(msg);
      setState("error");
    }
  };

  if (state === "unsupported") return null;

  if (state === "error") return (
    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      <span className="font-medium">Fehler:</span> {errorMsg || "Unbekannter Fehler"}
    </div>
  );

  return (
    <button
      onClick={handleSubscribe}
      disabled={state === "loading" || state === "denied" || state === "insecure"}
      className={`mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
        state === "subscribed"
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          : state === "denied" || state === "insecure"
          ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
          : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
      }`}
      title={
        state === "denied"
          ? "Benachrichtigungen wurden in den Browsereinstellungen blockiert. Bitte dort entsperren."
          : state === "insecure"
          ? "Benachrichtigungen erfordern eine HTTPS-Verbindung."
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
        : state === "insecure"
        ? "HTTPS erforderlich"
        : state === "loading"
        ? "Einen Moment…"
        : "Erinnere mich vor Sperrmüll-Terminen per Push Benachrichtigung"}
    </button>
  );
}
