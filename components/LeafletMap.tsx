"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/styles/map.css";
import config from "@/config";
import type { WasteFeature } from "@/lib/geojson";
import MarkerLayer from "./MarkerLayer";
import UserLocationMarker from "./UserLocationMarker";
import ExportButton from "./ExportButton";

interface LeafletMapProps {
  features: WasteFeature[];
  isLoading: boolean;
  selectedFeature: WasteFeature | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function LeafletMap({ features, isLoading, selectedFeature: _selectedFeature }: LeafletMapProps) {
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
      },
      () => {
        setGpsStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

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
      </MapContainer>

      <ExportButton />

      {isLoading && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/40">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-500" />
        </div>
      )}

      {!isLoading && features.length === 0 && (
        <div className="absolute inset-x-0 top-4 z-[500] flex justify-center">
          <div className="rounded-lg bg-white px-4 py-2 text-sm text-gray-600 shadow">
            No locations scheduled for today.
          </div>
        </div>
      )}

      {gpsStatus === "denied" && (
        <div className="absolute bottom-4 left-1/2 z-[500] -translate-x-1/2 rounded-lg bg-gray-800/90 px-3 py-1.5 text-sm text-white">
          Location unavailable
        </div>
      )}
    </div>
  );
}
