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
    .filter((s) => s.distance! <= radiusKm)
    .sort((a, b) => a.distance! - b.distance!);
}

interface SchoolRow {
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
  district?: string;
}

function rowToSchool(row: SchoolRow): School & { district?: string } {
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
    district: row.district,
  };
}

/**
 * Get all schools, optionally with borough info from the postcodes table.
 */
export function getAllSchools(): (School & { district?: string })[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT s.*, p.district
    FROM schools s
    LEFT JOIN postcodes p ON s.postcode = p.postcode
    ORDER BY s.name
  `).all() as SchoolRow[];

  return rows.map(rowToSchool);
}

/**
 * Get distinct boroughs that have schools.
 */
export function getDistinctBoroughs(): string[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT DISTINCT p.district
    FROM schools s
    JOIN postcodes p ON s.postcode = p.postcode
    WHERE p.district IS NOT NULL
    ORDER BY p.district
  `).all() as { district: string }[];

  return rows.map((r) => r.district);
}

/**
 * Get a single school by URN, with borough info.
 */
export function getSchoolByUrn(urn: number): (School & { district?: string }) | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT s.*, p.district
    FROM schools s
    LEFT JOIN postcodes p ON s.postcode = p.postcode
    WHERE s.urn = ?
  `).get(urn) as SchoolRow | undefined;

  if (!row) return null;
  return rowToSchool(row);
}

/**
 * Get nearby schools to a given school (by URN), excluding itself.
 */
export function getNearbySchools(urn: number, radiusKm = 1.5, limit = 10): School[] {
  const school = getSchoolByUrn(urn);
  if (!school) return [];

  const nearby = getSchools(school.lat, school.lng, radiusKm);
  return nearby.filter((s) => s.urn !== urn).slice(0, limit);
}

/**
 * Get distinct phases from schools.
 */
export function getDistinctPhases(): string[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT DISTINCT phase FROM schools WHERE phase IS NOT NULL ORDER BY phase
  `).all() as { phase: string }[];

  return rows.map((r) => r.phase);
}
