"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/styles/map.css";
import config from "@/config";
import type { WasteFeature } from "@/lib/geojson";
import MarkerLayer from "./MarkerLayer";
import UserLocationMarker from "./UserLocationMarker";
import ExportButton from "./ExportButton";

function PanToFeature({ feature }: { feature: WasteFeature | null }) {
  const map = useMap();
  useEffect(() => {
    if (!feature) return;
    const [lng, lat] = feature.geometry.coordinates;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15));
  }, [feature, map]);
  return null;
}

interface LeafletMapProps {
  features: WasteFeature[];
  isLoading: boolean;
  selectedFeature: WasteFeature | null;
  onPositionChange?: (pos: [number, number]) => void;
  mobileBottomOffset?: string;
  isMobile?: boolean;
  selectedDate?: string;
  override?: { date?: string; time?: string };
}

export default function LeafletMap({
  features,
  isLoading,
  selectedFeature,
  onPositionChange,
  mobileBottomOffset,
  isMobile = false,
  selectedDate,
  override,
}: LeafletMapProps) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [isFirstFix, setIsFirstFix] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<"pending" | "granted" | "denied">("pending");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setGpsStatus("granted");
        setIsFirstFix(false);
        onPositionChange?.(coords);
      },
      () => {
        setGpsStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [onPositionChange]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={config.mapDefaultCenter}
        zoom={config.mapDefaultZoom}
        minZoom={config.mapMinZoom}
        maxZoom={config.mapMaxZoom}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url={config.mapTileUrl}
          attribution={config.mapAttribution}
        />
        <MarkerLayer features={features} />
        <UserLocationMarker
          position={userPos}
          isFirstFix={isFirstFix}
        />
        <PanToFeature feature={selectedFeature} />
      </MapContainer>

      <ExportButton
        mobileBottomOffset={mobileBottomOffset}
        isMobile={isMobile}
        selectedDate={selectedDate}
        override={override}
      />

      {isLoading && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/40">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-500" />
        </div>
      )}

      {gpsStatus === "denied" && (
        <div className="absolute bottom-4 left-1/2 z-[500] -translate-x-1/2 rounded-lg bg-gray-800/90 px-3 py-1.5 text-sm text-white">
          Standort nicht verfügbar
        </div>
      )}
    </div>
  );
}
