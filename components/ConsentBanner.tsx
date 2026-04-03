"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      localStorage.removeItem("va-consent");
    }
    if (localStorage.getItem("va-consent") === null) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("va-consent", "granted");
    window.dispatchEvent(new Event("va-consent-update"));
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("va-consent", "denied");
    window.dispatchEvent(new Event("va-consent-update"));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie-Einwilligung"
      className="fixed bottom-0 left-0 right-0 z-[2000] border-t border-gray-200 bg-white px-4 py-4 shadow-lg sm:px-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Wir nutzen{" "}
          <span className="font-medium text-gray-800">Vercel Analytics</span>, um die Nutzung
          unserer Website pseudonymisiert auszuwerten (keine Cookies). Mehr Infos in unserer{" "}
          <Link
            href="/datenschutz"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={decline}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Ablehnen
          </button>
          <button
            onClick={accept}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
