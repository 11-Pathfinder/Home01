import { getDb } from "@/lib/db";
import { haversineDistance } from "@/lib/utils";
import type { School } from "@/lib/types";

/**
 * Query nearby schools by lat/lng within a given radius.
 * Uses R-Tree spatial index for fast lookups, then Haversine for exact filtering.
 */
export function getSchools(
  lat: number,
  lng: number,
  radiusKm = 3,
  phase?: string | null
): School[] {
  const db = getDb();

  // Approximate bounding box (1 degree lat ~ 111km, 1 degree lng ~ 70km at London)
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / 70;

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

  return rows
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
}
