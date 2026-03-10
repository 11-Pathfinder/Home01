import type { CrimeData, CrimeTrendPoint } from "./types";

const BASE_URL = "https://data.police.uk/api";

interface PoliceCrime {
  category: string;
  month: string;
  location: {
    latitude: string;
    longitude: string;
  };
}

/**
 * Fetch street-level crimes near a lat/lng for a given month (YYYY-MM).
 */
async function fetchCrimesForMonth(
  lat: number,
  lng: number,
  month: string
): Promise<PoliceCrime[]> {
  const url = `${BASE_URL}/crimes-street/all-crime?lat=${lat}&lng=${lng}&date=${month}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

/**
 * Get the last available crime data month.
 */
async function getLastUpdated(): Promise<string> {
  const res = await fetch(`${BASE_URL}/crime-last-updated`);
  if (!res.ok) {
    // Default to 2 months ago
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  const data = await res.json();
  return data.date.slice(0, 7); // "YYYY-MM"
}

/**
 * Fetch crime data for a location, covering the last 3 available months.
 * Returns aggregated crime data with category breakdown and trend.
 */
export async function getCrimeData(
  lat: number,
  lng: number
): Promise<CrimeData> {
  const lastMonth = await getLastUpdated();

  // Fetch last 3 months
  const months: string[] = [];
  const [year, month] = lastMonth.split("-").map(Number);
  for (let i = 0; i < 3; i++) {
    const d = new Date(year, month - 1 - i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }

  const results = await Promise.all(
    months.map((m) => fetchCrimesForMonth(lat, lng, m))
  );

  const byCategory: Record<string, number> = {};
  const trend: CrimeTrendPoint[] = [];
  let total = 0;

  results.forEach((crimes, idx) => {
    trend.push({ month: months[idx], count: crimes.length });
    total += crimes.length;
    for (const crime of crimes) {
      const cat = crime.category.replace(/-/g, " ");
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }
  });

  // Sort trend chronologically
  trend.sort((a, b) => a.month.localeCompare(b.month));

  return {
    total,
    byCategory,
    trend,
    londonAverage: null, // Could be computed from pre-loaded data
  };
}
