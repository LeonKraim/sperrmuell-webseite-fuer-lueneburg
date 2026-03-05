"use client";

import { useState, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CalendarX, ArrowUpDown } from "lucide-react";
import type { WasteFeature } from "@/lib/geojson";
import { haversineDistance, sortByDistance } from "@/lib/geojson";
import config from "@/config";

interface SidePanelProps {
  features: WasteFeature[];
  isLoading: boolean;
  userPosition: [number, number] | null;
  onStreetClick?: (feature: WasteFeature) => void;
}

export default function SidePanel({ features, isLoading, userPosition, onStreetClick }: SidePanelProps) {
  const [sortOrder, setSortOrder] = useState<"closest" | "furthest">(config.defaultSortOrder);
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

  return (
    <div className="flex h-full w-[280px] flex-shrink-0 flex-col border-l bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Sperrmüll Heute</span>
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
          // Skeleton loaders
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
                    className="w-full rounded-lg border p-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-sm">{feature.properties.street}</div>
                    <div className="text-xs text-gray-500">
                      {feature.properties.region}
                      {dist !== null && isFinite(dist) && (
                        <span> · {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`} away</span>
                      )}
                    </div>
                    <div className="text-xs text-red-600 truncate">
                      {feature.properties.matchedScheduleTypes.join(", ")}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
