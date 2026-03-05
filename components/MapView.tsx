"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import type { WasteFeatureCollection, WasteFeature } from "@/lib/geojson";

// Dynamically import to avoid SSR issues
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MapViewProps {
  onDataLoaded?: (features: WasteFeature[]) => void;
  onLoadingChange?: (loading: boolean) => void;
  selectedFeature?: WasteFeature | null;
  onPositionChange?: (pos: [number, number]) => void;
}

export default function MapView({ onDataLoaded, onLoadingChange, selectedFeature, onPositionChange }: MapViewProps) {
  const { data, error, isLoading } = useSWR<WasteFeatureCollection>("/api/today", fetcher);

  useEffect(() => {
    if (onLoadingChange) onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    if (data?.features && onDataLoaded) {
      onDataLoaded(data.features);
    }
  }, [data, onDataLoaded]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p className="text-gray-500">Data unavailable. Please try again later.</p>
      </div>
    );
  }

  return (
    <LeafletMap
      features={data?.features ?? []}
      isLoading={isLoading}
      selectedFeature={selectedFeature ?? null}
      onPositionChange={onPositionChange}
    />
  );
}
