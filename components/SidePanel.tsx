"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CalendarX, ArrowUpDown, ChevronsDown, ChevronsUp } from "lucide-react";
import type { WasteFeature } from "@/lib/geojson";
import { haversineDistance, sortByDistance } from "@/lib/geojson";
import config from "@/config";

interface SidePanelProps {
  features: WasteFeature[];
  isLoading: boolean;
  userPosition: [number, number] | null;
  onStreetClick?: (feature: WasteFeature) => void;
  onMobileStateChange?: (state: "hidden" | "peek" | "full") => void;
  filterDate?: string;
}

export default function SidePanel({
  features,
  isLoading,
  userPosition,
  onStreetClick,
  onMobileStateChange,
  filterDate = "",
}: SidePanelProps) {
  const [sortOrder, setSortOrder] = useState<"closest" | "furthest">(config.defaultSortOrder);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileState, setMobileState] = useState<"hidden" | "peek" | "full">("peek");
  const touchStartY = useRef<number | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(() => {
    const limited = features.slice(0, config.maxStreetsInPanel);
    return sortByDistance(limited, userPosition?.[0], userPosition?.[1], sortOrder);
  }, [features, userPosition, sortOrder]);

  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  const toggleSort = () => {
    setSortOrder((o) => (o === "closest" ? "furthest" : "closest"));
  };

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
      if (!event.matches) {
        setMobileState("peek");
      }
    };

    setIsMobile(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    onMobileStateChange?.(mobileState);
  }, [mobileState, onMobileStateChange]);

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = event.changedTouches[0]?.clientY ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) {
      return;
    }

    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
    const deltaY = endY - touchStartY.current;
    const threshold = 40;

    if (deltaY < -threshold) {
      setMobileState((prev) => {
        if (prev === "hidden") return "peek";
        if (prev === "peek") return "full";
        return prev;
      });
    }

    if (deltaY > threshold) {
      setMobileState((prev) => {
        if (prev === "full") return "peek";
        if (prev === "peek") return "hidden";
        return prev;
      });
    }

    touchStartY.current = null;
  };

  const mobilePanelHeightClass =
    mobileState === "full"
      ? "h-[78vh]"
      : mobileState === "peek"
        ? "h-[240px]"
        : "h-[48px]";

  const mobilePreview = sorted.slice(0, 2);

  return (
    <>
      <div className="hidden h-full w-[280px] flex-shrink-0 flex-col border-l bg-white md:flex">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Sperrmüll Abholung {filterDate}</span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              {features.length}
            </span>
          </div>
          <button
            onClick={toggleSort}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
            title={`Sort: ${sortOrder}`}
          >
            <ArrowUpDown className="h-3 w-3" />
            {sortOrder === "closest" ? "Closest" : "Furthest"}
          </button>
        </div>

        {/* Content */}
        <div ref={parentRef} className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-gray-400">
              <CalendarX className="h-10 w-10" />
              <p className="text-sm">Heute keine Sperrmüll-Abfuhr geplant.</p>
            </div>
          ) : (
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const feature = sorted[virtualItem.index];
                const [lng, lat] = feature.geometry.coordinates;
                const dist =
                  userPosition
                    ? haversineDistance(userPosition[0], userPosition[1], lat, lng)
                    : null;

                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                      padding: "4px 8px",
                    }}
                  >
                    <button
                      onClick={() => onStreetClick?.(feature)}
                      className="w-full rounded-lg border p-2 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="font-medium text-sm">{feature.properties.street}</div>
                      <div className="text-xs text-gray-500">
                        {feature.properties.region}
                        {dist !== null && isFinite(dist) && (
                          <span> · {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`} Entfernung</span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-[1000] overflow-hidden rounded-t-2xl border-t bg-white/95 shadow-2xl backdrop-blur-sm transition-[height] duration-300 md:hidden ${mobilePanelHeightClass}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          onClick={() => setMobileState((prev) => (prev === "hidden" ? "peek" : "hidden"))}
          className="absolute left-1/2 top-2 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm"
          title={mobileState === "hidden" ? "Show list" : "Hide list"}
          aria-label={mobileState === "hidden" ? "Show list" : "Hide list"}
        >
          {mobileState === "hidden" ? (
            <>
              <ChevronsUp className="h-3.5 w-3.5" />
              Listen
            </>
          ) : (
            <>
              <ChevronsDown className="h-3.5 w-3.5" />
              Verbergen
            </>
          )}
        </button>

        <div className="mx-auto mt-8 h-1.5 w-10 rounded-full bg-gray-300" />

        {mobileState !== "hidden" && (
          <>
            <div className="flex items-center justify-between border-b px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Sperrmüll Abholung {filterDate}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  {features.length}
                </span>
              </div>
              <button
                onClick={toggleSort}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
                title={`Sort: ${sortOrder}`}
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortOrder === "closest" ? "Closest" : "Furthest"}
              </button>
            </div>

            <div className="h-[calc(100%-72px)] overflow-y-auto pb-4">
              {isLoading ? (
                <div className="space-y-2 p-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-gray-400">
                  <CalendarX className="h-10 w-10" />
                  <p className="text-sm">Heute keine Sperrmüll-Abfuhr geplant.</p>
                </div>
              ) : mobileState === "peek" ? (
                <div className="space-y-2 p-2">
                  {mobilePreview.map((feature) => {
                    const [lng, lat] = feature.geometry.coordinates;
                    const dist =
                      userPosition
                        ? haversineDistance(userPosition[0], userPosition[1], lat, lng)
                        : null;

                    return (
                      <button
                        key={`${feature.properties.street}-${feature.properties.region}-${lng}-${lat}`}
                        onClick={() => onStreetClick?.(feature)}
                        className="w-full rounded-lg border p-2 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="font-medium text-sm">{feature.properties.street}</div>
                        <div className="text-xs text-gray-500">
                          {feature.properties.region}
                          {dist !== null && isFinite(dist) && (
                            <span> · {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`} Entfernung</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div ref={parentRef} className="h-full overflow-y-auto">
                  <div
                    style={{
                      height: `${virtualizer.getTotalSize()}px`,
                      width: "100%",
                      position: "relative",
                    }}
                  >
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                      const feature = sorted[virtualItem.index];
                      const [lng, lat] = feature.geometry.coordinates;
                      const dist =
                        userPosition
                          ? haversineDistance(userPosition[0], userPosition[1], lat, lng)
                          : null;

                      return (
                        <div
                          key={virtualItem.key}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                            padding: "4px 8px",
                          }}
                        >
                          <button
                            onClick={() => onStreetClick?.(feature)}
                            className="w-full rounded-lg border p-2 text-left transition-colors hover:bg-gray-50"
                          >
                            <div className="font-medium text-sm">{feature.properties.street}</div>
                            <div className="text-xs text-gray-500">
                              {feature.properties.region}
                              {dist !== null && isFinite(dist) && (
                                <span> · {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`} Entfernung</span>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isMobile && mobileState !== "hidden" && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[999] h-24 bg-gradient-to-t from-white/80 to-transparent md:hidden" />
      )}
    </>
  );
}
