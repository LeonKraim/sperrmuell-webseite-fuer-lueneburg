"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LoadingBar from "./LoadingBar";
import Throbber from "./Throbber";
import AdBanner from "./AdBanner";
import SidePanel from "./SidePanel";
import config from "@/config";
import { formatDateAsDDMMYYYY, parseGermanDate } from "@/lib/dateUtils";
import type { WasteFeature } from "@/lib/geojson";
import type { WasteFeatureCollection } from "@/lib/geojson";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function AppShell() {
  const searchParams = useSearchParams();
  const [features, setFeatures] = useState<WasteFeature[]>([]);
  const [filterDate, setFilterDate] = useState<string>("");
  const [nextCollectionDate, setNextCollectionDate] = useState<string>("");
  const [baseDate, setBaseDate] = useState<string>("");
  const [dayOffset, setDayOffset] = useState(0);
  const [mapLoading, setMapLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<WasteFeature | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [mobilePanelState, setMobilePanelState] = useState<"hidden" | "peek" | "full">("peek");
  const [isMobile, setIsMobile] = useState(false);
  
  // Extract override parameters from URL if present
  const overrideDate = searchParams.get("overrideDate");
  const overrideTime = searchParams.get("overrideTime");
  const override = overrideDate || overrideTime ? { date: overrideDate ?? undefined, time: overrideTime ?? undefined } : undefined;

  const isFullyLoaded = !mapLoading;

  const selectedDateParam = useMemo(() => {
    if (!baseDate || dayOffset === 0) {
      return undefined;
    }

    try {
      const selectedDate = parseGermanDate(baseDate);
      selectedDate.setDate(selectedDate.getDate() + dayOffset);
      return formatDateAsDDMMYYYY(selectedDate);
    } catch {
      return undefined;
    }
  }, [baseDate, dayOffset]);

  const handleDataLoaded = useCallback((data: WasteFeatureCollection) => {
    setFeatures(data.features);
    setFilterDate(data.filterDate || "");
    setNextCollectionDate(data.nextCollectionDate || data.filterDate || "");
    setBaseDate((current) => current || data.filterDate || "");
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

  useEffect(() => {
    setBaseDate("");
    setFilterDate("");
    setNextCollectionDate("");
    setDayOffset(0);
    setSelectedFeature(null);
    setMapLoading(true);
  }, [overrideDate, overrideTime]);

  const mobilePanelHeight =
    mobilePanelState === "full"
      ? "78vh"
      : mobilePanelState === "peek"
        ? "240px"
        : "48px";

  const canGoBack = dayOffset > 0;
  const canGoForward = Boolean(baseDate) && dayOffset < 7;

  const moveByDays = (delta: number) => {
    setSelectedFeature(null);
    setMapLoading(true);
    setDayOffset((current) => Math.max(0, Math.min(7, current + delta)));
  };

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
          <div className="absolute left-1/2 top-4 z-[1200] -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-2 py-2 shadow-lg backdrop-blur-sm">
              <button
                onClick={() => moveByDays(-1)}
                disabled={!canGoBack}
                className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                aria-label="Vorheriger Tag"
                title="Vorheriger Tag"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="min-w-[170px] px-2 text-center text-sm font-semibold text-gray-900">
                {filterDate || "Datum wird geladen..."}
              </div>
              <button
                onClick={() => moveByDays(1)}
                disabled={!canGoForward}
                className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                aria-label="Nächster Tag"
                title="Nächster Tag"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <MapView
            onDataLoaded={handleDataLoaded}
            onLoadingChange={handleLoadingChange}
            selectedFeature={selectedFeature}
            onPositionChange={setUserPosition}
            override={override}
            selectedDate={selectedDateParam}
            mobileBottomOffset={`calc(${mobilePanelHeight} + 1vh)`}
            isMobile={isMobile}
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
          nextCollectionDate={nextCollectionDate}
        />
      </div>
    </>
  );
}
