import { NextRequest, NextResponse } from "next/server";
import { lookupPostcode } from "@/lib/postcodes";
import { getSchools } from "@/lib/queries/schools";
import { getPrices } from "@/lib/queries/prices";
import { getDemographics } from "@/lib/queries/demographics";
import { getCrimeData } from "@/lib/police-api";
import { getNearbyStations } from "@/lib/tfl-api";
import { getCached, setCache } from "@/lib/cache";
import type { AreaIntelligence } from "@/lib/types";

/**
 * Aggregated area intelligence endpoint.
 * Calls query functions directly instead of HTTP self-calls.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postcode: string }> }
) {
  const { postcode } = await params;
  const decoded = decodeURIComponent(postcode);

  // 1. Geocode the postcode
  const postcodeInfo = await lookupPostcode(decoded);
  if (!postcodeInfo) {
    return NextResponse.json(
      { error: "Postcode not found" },
      { status: 404 }
    );
  }

  const { lat, lng, lsoa_code } = postcodeInfo;

  // 2. Fetch all data sources in parallel
  // DB queries are synchronous, external APIs are async
  const prices = getPrices(decoded);
  const schools = getSchools(lat, lng, 3);
  const demographics = lsoa_code ? getDemographics(lsoa_code) : null;

  // External API calls with caching (same pattern as individual route handlers)
  const crimeCacheKey = `crime:${lat.toFixed(3)}:${lng.toFixed(3)}`;
  const transportCacheKey = `transport:${lat.toFixed(3)}:${lng.toFixed(3)}`;

  const [crimeResult, transportResult] = await Promise.allSettled([
    (async () => {
      const cached = getCached(crimeCacheKey);
      if (cached) return JSON.parse(cached);
      const data = await getCrimeData(lat, lng);
      try { setCache(crimeCacheKey, JSON.stringify(data), 86400); } catch {}
      return data;
    })(),
    (async () => {
      const cached = getCached(transportCacheKey);
      if (cached) return JSON.parse(cached);
      const stations = await getNearbyStations(lat, lng);
      try { setCache(transportCacheKey, JSON.stringify({ stations }), 86400 * 7); } catch {}
      return { stations };
    })(),
  ]);

  const result: AreaIntelligence = {
    postcode: postcodeInfo,
    prices,
    crime: crimeResult.status === "fulfilled" ? crimeResult.value : null,
    schools,
    transport:
      transportResult.status === "fulfilled"
        ? transportResult.value?.stations ?? []
        : [],
    demographics,
  };

  return NextResponse.json(result);
}
