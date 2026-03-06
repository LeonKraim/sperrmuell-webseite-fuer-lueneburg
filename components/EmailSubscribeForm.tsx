"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, X } from "lucide-react";

type FormState = "idle" | "loading" | "sent" | "error";

export default function EmailSubscribeForm() {
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formState === "loading") return;
    setFormState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/email-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg =
          body?.error === "invalid_email"
            ? "Ungültige E-Mail-Adresse."
            : body?.error === "rate_limit_exceeded"
            ? "Zu viele Anfragen. Bitte warte einen Moment."
            : "Ein Fehler ist aufgetreten.";
        setErrorMsg(msg);
        setFormState("error");
        return;
      }

      setFormState("sent");
    } catch {
      setErrorMsg("Verbindungsfehler. Bitte versuche es erneut.");
      setFormState("error");
    }
  };

  return (
    <>
      {/* Trigger button — same size/style as NotificationButton */}
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
      >
        <Mail className="h-4 w-4" />
        Erinnere mich vor Sperrmüll-Terminen per E-Mail
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <div
            ref={dialogRef}
            className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-800">
                  E-Mail-Benachrichtigungen
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formState === "sent" ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-800">Bestätigungs-E-Mail gesendet!</p>
                <p className="text-xs text-gray-500">Bitte prüfe dein Postfach und klicke auf den Bestätigungslink.</p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Schließen
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="mb-4 text-xs text-gray-500">
                  Gib deine E-Mail-Adresse ein um einen Tag vor der Sperrmüll-Abfuhr benachrichtigt zu werden.
                </p>
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  required
                  disabled={formState === "loading"}
                  className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 disabled:opacity-60"
                />
                {formState === "error" && (
                  <p className="mb-2 text-xs text-red-600">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-60"
                >
                  {formState === "loading" ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  {formState === "loading" ? "Einen Moment…" : "Anmelden"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
