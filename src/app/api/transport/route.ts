import { NextRequest, NextResponse } from "next/server";
import { getNearbyStations } from "@/lib/tfl-api";
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

  const cacheKey = `transport:${lat.toFixed(3)}:${lng.toFixed(3)}`;

  try {
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const stations = await getNearbyStations(lat, lng);

    try {
      setCache(cacheKey, JSON.stringify({ stations }), 86400 * 7); // Cache 7 days
    } catch {
      // Cache failure non-fatal
    }

    return NextResponse.json({ stations });
  } catch (err) {
    console.error("Transport API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch transport data" },
      { status: 500 }
    );
  }
}
