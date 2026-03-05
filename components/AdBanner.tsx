"use client";

import { useEffect } from "react";
import config from "@/config";

interface AdBannerProps {
  slot: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdBanner({ slot, className }: AdBannerProps) {
  useEffect(() => {
    if (!config.adsEnabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense blocked — graceful degradation
    }
  }, []);

  if (!config.adsEnabled || !process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUBLISHER_ID) {
    return <div className={`w-[160px] bg-gray-100 ${className || ""}`} aria-hidden="true" />;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: `${config.adBannerWidthPx}px`, height: "600px" }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
      />
    </div>
  );
}
