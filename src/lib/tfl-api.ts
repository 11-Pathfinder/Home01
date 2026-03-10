import type { Station } from "./types";

const BASE_URL = "https://api.tfl.gov.uk";

interface TflStopPoint {
  commonName: string;
  lat: number;
  lon: number;
  distance: number;
  modes: string[];
  lines: { id: string; name: string }[];
}

/**
 * Find nearest transport stations to a given lat/lng.
 * Uses the TfL StopPoint API.
 */
export async function getNearbyStations(
  lat: number,
  lng: number,
  radius = 1500
): Promise<Station[]> {
  const stopTypes = [
    "NaptanMetroStation",
    "NaptanRailStation",
    "NaptanPublicBusCoachTram",
  ].join(",");

  const appKey = process.env.TFL_APP_KEY;
  const keyParam = appKey ? `&app_key=${appKey}` : "";

  const url = `${BASE_URL}/StopPoint?lat=${lat}&lon=${lng}&stopTypes=${stopTypes}&radius=${radius}${keyParam}`;
  const res = await fetch(url);

  if (!res.ok) return [];

  const data = await res.json();
  const stopPoints: TflStopPoint[] = data.stopPoints ?? [];

  // Deduplicate by name (some stations have multiple entries)
  const seen = new Set<string>();
  const stations: Station[] = [];

  for (const sp of stopPoints) {
    if (seen.has(sp.commonName)) continue;
    seen.add(sp.commonName);

    const mode = sp.modes.includes("tube")
      ? "tube"
      : sp.modes.includes("dlr")
        ? "dlr"
        : sp.modes.includes("overground")
          ? "overground"
          : sp.modes.includes("elizabeth-line")
            ? "elizabeth-line"
            : sp.modes.includes("national-rail")
              ? "rail"
              : sp.modes[0] ?? "bus";

    // Skip buses — too many, not useful for home buying
    if (mode === "bus") continue;

    stations.push({
      name: sp.commonName,
      mode,
      lines: sp.lines?.map((l) => l.name) ?? [],
      lat: sp.lat,
      lng: sp.lon,
      distance: Math.round(sp.distance),
    });
  }

  return stations.sort((a, b) => a.distance - b.distance);
}
