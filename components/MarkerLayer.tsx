"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import config from "@/config";
import type { WasteFeature } from "@/lib/geojson";

interface MarkerLayerProps {
  features: WasteFeature[];
  onMarkerClick?: (feature: WasteFeature) => void;
}

export default function MarkerLayer({ features, onMarkerClick }: MarkerLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!features.length) return;

    const markers: L.CircleMarker[] = [];
    const bounds = L.latLngBounds([]);

    features.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const latLng: L.LatLngTuple = [lat, lng];

      const marker = L.circleMarker(latLng, {
        radius: 10,
        fillColor: config.todayMarkerColor,
        color: config.todayMarkerBorderColor,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      });

      const { street, matchedScheduleTypes } = feature.properties;
      marker.bindPopup(
        `<div class="text-sm">
          <strong class="font-semibold">${street}</strong><br/>
          <span class="text-xs text-red-600">${matchedScheduleTypes.join(", ")}</span>
        </div>`
      );

      marker.on("click", () => {
        if (onMarkerClick) onMarkerClick(feature);
      });

      marker.addTo(map);
      markers.push(marker);
      bounds.extend(latLng);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [features, map, onMarkerClick]);

  return null;
}
