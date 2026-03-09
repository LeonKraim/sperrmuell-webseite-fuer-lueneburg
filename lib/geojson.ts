export interface WasteFeatureProperties {
  region: string;
  street: string;
  address: string;
  matchedScheduleTypes: string[];
  waste_schedules?: Record<string, string[]>;
}

export interface WasteFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: WasteFeatureProperties;
}

export interface WasteFeatureCollection {
  type: "FeatureCollection";
  date: string;
  filterDate?: string; // The German-formatted date used for filtering (e.g., "Sa. 26.12.2026")
  nextCollectionDate?: string;
  features: WasteFeature[];
}

/**
 * Filter a GeoJSON FeatureCollection to features matching the given date string.
 * Strips waste_schedules from returned features, adds matchedScheduleTypes.
 */
export function filterByDate(
  geojson: { type: string; features: { type: string; geometry: unknown; properties: Record<string, unknown> }[] },
  dateString: string
): WasteFeatureCollection {
  const matched: WasteFeature[] = [];

  for (const feature of geojson.features || []) {
    const props = feature.properties || {};
    const schedules = props.waste_schedules as Record<string, string[]> | undefined;

    if (!schedules || typeof schedules !== "object") {
      continue;
    }

    const matchedTypes: string[] = [];

    for (const [scheduleType, dates] of Object.entries(schedules)) {
      if (Array.isArray(dates) && dates.includes(dateString)) {
        matchedTypes.push(scheduleType);
      }
    }

    if (matchedTypes.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { waste_schedules: _stripped, ...restProps } = props;
      matched.push({
        type: "Feature",
        geometry: feature.geometry as { type: string; coordinates: number[] },
        properties: {
          region: String(restProps.region || ""),
          street: String(restProps.street || ""),
          address: String(restProps.address || ""),
          matchedScheduleTypes: matchedTypes,
        },
      });
    }
  }

  // Derive an ISO date from the dateString (DD.MM.YYYY part) for the response
  // dateString format: "Di. 27.01.2026" — extract DD.MM.YYYY
  let isoDate: string;
  const datePart = dateString.replace(/^[A-Za-z]+\.\s*/, "");
  const parts = datePart.split(".");
  if (parts.length === 3) {
    isoDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  } else {
    isoDate = new Date().toISOString().split("T")[0];
  }

  return {
    type: "FeatureCollection",
    date: isoDate,
    filterDate: dateString, // Include the German-formatted date used for filtering
    features: matched,
  };
}

/**
 * Calculate haversine distance between two lat/lng points (in km).
 */
export function haversineDistance(
  lat1: number | null | undefined,
  lng1: number | null | undefined,
  lat2: number | null | undefined,
  lng2: number | null | undefined
): number {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
    return Infinity;
  }

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Sort features by distance from user location.
 * If no user location, sort alphabetically by street name.
 */
export function sortByDistance(
  features: WasteFeature[],
  userLat: number | null | undefined,
  userLng: number | null | undefined,
  order: "closest" | "furthest" = "closest"
): WasteFeature[] {
  if (userLat == null || userLng == null) {
    return [...features].sort((a, b) =>
      (a.properties.street || "").localeCompare(b.properties.street || "")
    );
  }

  return [...features].sort((a, b) => {
    const [aLng, aLat] = a.geometry.coordinates;
    const [bLng, bLat] = b.geometry.coordinates;
    const distA = haversineDistance(userLat, userLng, aLat, aLng);
    const distB = haversineDistance(userLat, userLng, bLat, bLng);
    return order === "closest" ? distA - distB : distB - distA;
  });
}
