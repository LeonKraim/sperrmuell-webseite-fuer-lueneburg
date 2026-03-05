"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import LoadingBar from "./LoadingBar";
import Throbber from "./Throbber";
import AdBanner from "./AdBanner";
import SidePanel from "./SidePanel";
import config from "@/config";
import type { WasteFeature } from "@/lib/geojson";
import type { DateTimeOverride } from "@/lib/dateOverride";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function AppShell() {
  const searchParams = useSearchParams();
  const [features, setFeatures] = useState<WasteFeature[]>([]);
  const [filterDate, setFilterDate] = useState<string>("");
  const [mapLoading, setMapLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<WasteFeature | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [mobilePanelState, setMobilePanelState] = useState<"hidden" | "peek" | "full">("peek");
  const [isMobile, setIsMobile] = useState(false);
  
  // Extract override parameters from URL
  const override: DateTimeOverride = {
    date: searchParams.get("overrideDate") ?? undefined,
    time: searchParams.get("overrideTime") ?? undefined,
  };

  const isFullyLoaded = !mapLoading;

  const handleDataLoaded = useCallback((f: WasteFeature[], date: string) => {
    setFeatures(f);
    setFilterDate(date);
    setMapLoading(false);
  }, []);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setMapLoading(loading);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(media.matches);
    media.addEventListener("change", onChange);

    return () => media.removeEventListener("change", onChange);
  }, []);

  const mobilePanelHeight =
    mobilePanelState === "full"
      ? "78vh"
      : mobilePanelState === "peek"
        ? "240px"
        : "48px";

  return (
    <>
      <LoadingBar done={isFullyLoaded} />
      <Throbber visible={!isFullyLoaded} />

      <div className="flex h-screen w-full overflow-hidden">
        {/* Left Ad */}
        {config.adSidebarsEnabled && (
          <div className="hidden lg:flex flex-shrink-0 items-start justify-center pt-4">
            <AdBanner slot={config.adSlotLeft} />
          </div>
        )}

        {/* Map Area */}
        <div className="relative flex-1 overflow-hidden">
          <MapView
            onDataLoaded={handleDataLoaded}
            onLoadingChange={handleLoadingChange}
            selectedFeature={selectedFeature}
            onPositionChange={setUserPosition}
            override={override}
          />
          
          {/* Credit Link */}
          <a
            href="https://github.com/LeonKraim"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed left-4 z-[1200] rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-md transition-[bottom,background-color] duration-300 hover:bg-white md:bottom-4"
            style={isMobile ? { bottom: `calc(${mobilePanelHeight} + 1vh)` } : undefined}
            title="Made by Leon Kraim"
          >
            Made by Leon Kraim
          </a>
        </div>

        {/* Right Ad */}
        {config.adSidebarsEnabled && (
          <div className="hidden lg:flex flex-shrink-0 items-start justify-center pt-4">
            <AdBanner slot={config.adSlotRight} />
          </div>
        )}

        {/* Side Panel */}
        <SidePanel
          features={features}
          isLoading={mapLoading}
          userPosition={userPosition}
          onStreetClick={setSelectedFeature}
          onMobileStateChange={setMobilePanelState}
          filterDate={filterDate}
        />
      </div>
    </>
  );
}
