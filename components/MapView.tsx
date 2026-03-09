"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import type { WasteFeatureCollection, WasteFeature } from "@/lib/geojson";

// Dynamically import to avoid SSR issues
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MapViewProps {
  onDataLoaded?: (data: WasteFeatureCollection) => void;
  onLoadingChange?: (loading: boolean) => void;
  selectedFeature?: WasteFeature | null;
  onPositionChange?: (pos: [number, number]) => void;
  override?: { date?: string; time?: string } | undefined;
  selectedDate?: string;
  mobileBottomOffset?: string;
  isMobile?: boolean;
}

export default function MapView({
  onDataLoaded,
  onLoadingChange,
  selectedFeature,
  onPositionChange,
  override,
  selectedDate,
  mobileBottomOffset,
  isMobile = false,
}: MapViewProps) {
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (override?.date) params.append("overrideDate", override.date);
    if (override?.time) params.append("overrideTime", override.time);
    if (selectedDate) params.append("selectedDate", selectedDate);
    
    const queryString = params.toString();
    return queryString ? `/api/today?${queryString}` : "/api/today";
  }, [override, selectedDate]);

  const { data, error, isLoading } = useSWR<WasteFeatureCollection>(apiUrl, fetcher);

  useEffect(() => {
    if (onLoadingChange) onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    if (data?.features && onDataLoaded) {
      onDataLoaded(data);
    }
  }, [data, onDataLoaded]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p className="text-gray-500">Daten nicht verfügbar. Bitte versuchen Sie es später erneut.</p>
      </div>
    );
  }

  return (
    <LeafletMap
      features={data?.features ?? []}
      isLoading={isLoading}
      selectedFeature={selectedFeature ?? null}
      onPositionChange={onPositionChange}
      mobileBottomOffset={mobileBottomOffset}
      isMobile={isMobile}
      selectedDate={selectedDate}
      override={override}
    />
  );
}
