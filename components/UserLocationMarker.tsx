"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import config from "@/config";

interface UserLocationMarkerProps {
  position: [number, number] | null;
  isFirstFix: boolean;
}

export default function UserLocationMarker({ position, isFirstFix }: UserLocationMarkerProps) {
  const map = useMap();
  const markerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (!position) return;

    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    } else {
      markerRef.current = L.circleMarker(position, {
        radius: 12,
        fillColor: config.userLocationColor,
        color: config.userLocationPulseColor,
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
        className: "user-location-pulse",
      }).addTo(map);
    }

    if (isFirstFix) {
      map.flyTo(position, config.mapDefaultZoom);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [position, isFirstFix, map]);

  return null;
}
