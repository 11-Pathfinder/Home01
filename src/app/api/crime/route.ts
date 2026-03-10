import { NextRequest, NextResponse } from "next/server";
import { getCrimeData } from "@/lib/police-api";
import { getCached, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lng" },
      { status: 400 }
    );
  }

  // Round coords to 3 decimal places for cache key (approx 100m precision)
  const cacheKey = `crime:${lat.toFixed(3)}:${lng.toFixed(3)}`;

  try {
    // Check cache
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const data = await getCrimeData(lat, lng);

    // Cache for 24 hours
    try {
      setCache(cacheKey, JSON.stringify(data), 86400);
    } catch {
      // Cache write failure is non-fatal
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Crime API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch crime data" },
      { status: 500 }
    );
  }
}
