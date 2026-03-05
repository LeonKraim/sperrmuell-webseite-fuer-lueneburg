"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import LoadingBar from "./LoadingBar";
import Throbber from "./Throbber";
import AdBanner from "./AdBanner";
import SidePanel from "./SidePanel";
import config from "@/config";
import type { WasteFeature } from "@/lib/geojson";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function AppShell() {
  const [features, setFeatures] = useState<WasteFeature[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<WasteFeature | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  const isFullyLoaded = !mapLoading;

  const handleDataLoaded = useCallback((f: WasteFeature[]) => {
    setFeatures(f);
    setMapLoading(false);
  }, []);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setMapLoading(loading);
  }, []);

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
          />
          
          {/* Credit Link */}
          <a
            href="https://github.com/LeonKraim"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-4 z-[1100] rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-md hover:bg-white transition-colors"
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
        />
      </div>
    </>
  );
}
