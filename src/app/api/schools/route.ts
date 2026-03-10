import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { haversineDistance } from "@/lib/utils";
import type { School } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  const radiusKm = parseFloat(searchParams.get("radius") || "3");
  const phase = searchParams.get("phase"); // "Primary", "Secondary", or null for all

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lng" },
      { status: 400 }
    );
  }

  try {
    const db = getDb();

    // Approximate bounding box (1 degree lat ~ 111km, 1 degree lng ~ 70km at London)
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / 70;

    // Use R-Tree for spatial lookup
    let query = `
      SELECT s.* FROM schools s
      INNER JOIN schools_rtree r ON s.urn = r.id
      WHERE r.min_lat >= ? AND r.max_lat <= ?
      AND r.min_lng >= ? AND r.max_lng <= ?
    `;
    const params: (string | number)[] = [
      lat - latDelta,
      lat + latDelta,
      lng - lngDelta,
      lng + lngDelta,
    ];

    if (phase) {
      query += " AND s.phase = ?";
      params.push(phase);
    }

    const rows = db.prepare(query).all(...params) as {
      urn: number;
      name: string;
      phase: string;
      type: string;
      postcode: string;
      lat: number;
      lng: number;
      ofsted_rating: string | null;
      last_inspection_date: string | null;
      number_of_pupils: number | null;
      gender: string | null;
      religious_character: string | null;
      website: string | null;
    }[];

    // Calculate actual distances and filter to exact radius
    const schools: School[] = rows
      .map((row) => {
        const distance = haversineDistance(lat, lng, row.lat, row.lng);
        return {
          urn: row.urn,
          name: row.name,
          phase: row.phase,
          type: row.type,
          postcode: row.postcode,
          lat: row.lat,
          lng: row.lng,
          ofstedRating: row.ofsted_rating,
          lastInspectionDate: row.last_inspection_date,
          numberOfPupils: row.number_of_pupils,
          gender: row.gender,
          religiousCharacter: row.religious_character,
          website: row.website,
          distance,
        };
      })
      .filter((s) => s.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({ schools });
  } catch (err) {
    console.error("Schools API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch school data" },
      { status: 500 }
    );
  }
}
