/**
 * One-time migration script: re-geocode GeoJSON coordinates from house-level
 * to street-level using Nominatim (OpenStreetMap).
 *
 * Usage: node scripts/geocode-streets.mjs
 *
 * Respects Nominatim's 1 request/second rate limit.
 * Creates a backup of the original file before overwriting.
 */

import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "waste_schedules.geojson");
const BACKUP_PATH = join(__dirname, "..", "data", "waste_schedules.backup.geojson");
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DELAY_MS = 1100; // slightly over 1s to respect rate limit

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract ZIP code from an address like "Achterstücke    1, 21365 Adendorf"
 */
function extractZip(address) {
  const match = address.match(/,\s*(\d{5})\s/);
  return match ? match[1] : null;
}

/**
 * Query Nominatim for street-level coordinates.
 * Uses structured query: street name + city + postal code + country.
 */
async function geocodeStreet(street, region, zip) {
  const params = new URLSearchParams({
    street: street,
    city: region,
    country: "Germany",
    format: "json",
    limit: "1",
  });
  if (zip) {
    params.set("postalcode", zip);
  }

  const url = `${NOMINATIM_URL}?${params}`;
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "WasteMapGeocoder/1.0 (street-level migration)",
    },
  });

  if (!resp.ok) {
    throw new Error(`Nominatim returned ${resp.status} for "${street}, ${region}"`);
  }

  const results = await resp.json();
  if (results.length === 0) {
    return null;
  }

  return {
    lat: parseFloat(results[0].lat),
    lon: parseFloat(results[0].lon),
  };
}

async function main() {
  console.log("Reading GeoJSON...");
  const raw = readFileSync(DATA_PATH, "utf-8");
  const geojson = JSON.parse(raw);
  const features = geojson.features;

  console.log(`Total features: ${features.length}`);
  console.log(`Creating backup at ${BACKUP_PATH}...`);
  copyFileSync(DATA_PATH, BACKUP_PATH);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    const { street, region, address } = feature.properties;
    const zip = extractZip(address);

    const progress = `[${i + 1}/${features.length}]`;

    try {
      const result = await geocodeStreet(street, region, zip);

      if (result) {
        const oldCoords = [...feature.geometry.coordinates];
        feature.geometry.coordinates = [result.lon, result.lat];
        updated++;
        console.log(
          `${progress} ✓ ${street}, ${region}: [${oldCoords}] → [${result.lon}, ${result.lat}]`
        );
      } else {
        skipped++;
        console.log(`${progress} ⊘ ${street}, ${region}: no result, keeping original coordinates`);
      }
    } catch (err) {
      failed++;
      console.error(`${progress} ✗ ${street}, ${region}: ${err.message}`);
    }

    // Rate limit: 1 request per second
    if (i < features.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nWriting updated GeoJSON...`);
  writeFileSync(DATA_PATH, JSON.stringify(geojson, null, 2), "utf-8");

  console.log(`\nDone!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (no result): ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Backup saved at: ${BACKUP_PATH}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
