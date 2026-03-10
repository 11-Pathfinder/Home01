import { NextRequest, NextResponse } from "next/server";
import { getSchools } from "@/lib/queries/schools";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  const radiusKm = parseFloat(searchParams.get("radius") || "3");
  const phase = searchParams.get("phase");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lng" },
      { status: 400 }
    );
  }

  try {
    const schools = getSchools(lat, lng, radiusKm, phase);
    return NextResponse.json({ schools });
  } catch (err) {
    console.error("Schools API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch school data" },
      { status: 500 }
    );
  }
}
