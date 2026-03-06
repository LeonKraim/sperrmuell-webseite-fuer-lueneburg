"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

type State = "idle" | "loading" | "sent" | "error";

export default function EmailSubscribeForm() {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/email-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.error === "invalid_email"
          ? "Ungültige E-Mail-Adresse."
          : body?.error === "rate_limit_exceeded"
          ? "Zu viele Anfragen. Bitte warte einen Moment."
          : "Ein Fehler ist aufgetreten.";
        setErrorMsg(msg);
        setState("error");
        return;
      }

      setState("sent");
    } catch {
      setErrorMsg("Verbindungsfehler. Bitte versuche es erneut.");
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="mt-2 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
        <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>Bestätigungs-E-Mail gesendet! Bitte prüfe dein Postfach.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 w-full">
      <div className="flex gap-1.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.de"
          required
          disabled={state === "loading"}
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "loading" ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Mail className="h-3.5 w-3.5" />
          )}
          {state === "loading" ? "…" : "E-Mail"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-1 text-xs text-red-600">{errorMsg}</p>
      )}
    </form>
  );
}
