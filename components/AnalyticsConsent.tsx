"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";

export default function AnalyticsConsent() {
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    setConsent(localStorage.getItem("va-consent"));

    function handleUpdate() {
      setConsent(localStorage.getItem("va-consent"));
    }

    window.addEventListener("va-consent-update", handleUpdate);
    return () => window.removeEventListener("va-consent-update", handleUpdate);
  }, []);

  if (consent !== "granted") return null;
  return <Analytics />;
}
