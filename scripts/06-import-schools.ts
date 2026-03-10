/**
 * Import GIAS + Ofsted data into SQLite, filtered to Greater London.
 *
 * Expected files in data/schools/:
 *   - gias-establishments.csv (from GIAS download)
 *   - ofsted-mi.csv (from Ofsted management information)
 *
 * Run: npx tsx scripts/06-import-schools.ts
 */
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { getScriptDb, initSchema } from "./utils/db";

/**
 * Convert OS National Grid (Easting/Northing) to WGS84 lat/lng.
 * Uses Helmert transformation — accurate to ~5m for UK coordinates.
 */
function osgbToLatLng(easting: number, northing: number): { lat: number; lng: number } | null {
  if (!easting || !northing || easting < 0 || northing < 0) return null;

  // Airy 1830 ellipsoid
  const a = 6377563.396, b = 6356256.909;
  const F0 = 0.9996012717;
  const lat0 = (49 * Math.PI) / 180;
  const lon0 = (-2 * Math.PI) / 180;
  const N0 = -100000, E0 = 400000;
  const e2 = 1 - (b * b) / (a * a);
  const n = (a - b) / (a + b);

  let lat = lat0, M = 0;
  do {
    lat = ((northing - N0 - M) / (a * F0)) + lat;
    M = b * F0 * (
      (1 + n + (5/4)*n*n + (5/4)*n*n*n) * (lat - lat0)
      - (3*n + 3*n*n + (21/8)*n*n*n) * Math.sin(lat - lat0) * Math.cos(lat + lat0)
      + ((15/8)*n*n + (15/8)*n*n*n) * Math.sin(2*(lat - lat0)) * Math.cos(2*(lat + lat0))
      - (35/24)*n*n*n * Math.sin(3*(lat - lat0)) * Math.cos(3*(lat + lat0))
    );
  } while (Math.abs(northing - N0 - M) >= 0.00001);

  const cosLat = Math.cos(lat), sinLat = Math.sin(lat), tanLat = Math.tan(lat);
  const nu = a * F0 / Math.sqrt(1 - e2 * sinLat * sinLat);
  const rho = a * F0 * (1 - e2) / Math.pow(1 - e2 * sinLat * sinLat, 1.5);
  const eta2 = nu / rho - 1;

  const dE = easting - E0;
  const VII = tanLat / (2 * rho * nu);
  const VIII = tanLat / (24 * rho * nu*nu*nu) * (5 + 3*tanLat*tanLat + eta2 - 9*tanLat*tanLat*eta2);
  const IX = tanLat / (720 * rho * Math.pow(nu, 5)) * (61 + 90*tanLat*tanLat + 45*Math.pow(tanLat, 4));
  const X = 1 / (cosLat * nu);
  const XI = 1 / (cosLat * 6 * nu*nu*nu) * (nu/rho + 2*tanLat*tanLat);
  const XII = 1 / (cosLat * 120 * Math.pow(nu, 5)) * (5 + 28*tanLat*tanLat + 24*Math.pow(tanLat, 4));

  let osgbLat = lat - VII*dE*dE + VIII*Math.pow(dE,4) - IX*Math.pow(dE,6);
  let osgbLon = lon0 + X*dE - XI*Math.pow(dE,3) + XII*Math.pow(dE,5);

  // Helmert transform from OSGB36 to WGS84
  const tx = 446.448, ty = -125.157, tz = 542.06;
  const s = -20.4894e-6;
  const rx = (0.1502 / 3600) * Math.PI / 180;
  const ry = (0.247 / 3600) * Math.PI / 180;
  const rz = (0.8421 / 3600) * Math.PI / 180;

  const sinOLat = Math.sin(osgbLat), cosOLat = Math.cos(osgbLat);
  const sinOLon = Math.sin(osgbLon), cosOLon = Math.cos(osgbLon);
  const nu2 = a / Math.sqrt(1 - e2 * sinOLat * sinOLat);
  const x1 = (nu2 + 0) * cosOLat * cosOLon;
  const y1 = (nu2 + 0) * cosOLat * sinOLon;
  const z1 = ((1 - e2) * nu2 + 0) * sinOLat;

  const x2 = tx + (1 + s) * x1 + (-rz) * y1 + (ry) * z1;
  const y2 = ty + (rz) * x1 + (1 + s) * y1 + (-rx) * z1;
  const z2 = tz + (-ry) * x1 + (rx) * y1 + (1 + s) * z1;

  // WGS84 ellipsoid
  const aW = 6378137, bW = 6356752.3142;
  const e2W = 1 - (bW * bW) / (aW * aW);
  const p = Math.sqrt(x2 * x2 + y2 * y2);
  let wgsLat = Math.atan2(z2, p * (1 - e2W));
  for (let i = 0; i < 10; i++) {
    const nuW = aW / Math.sqrt(1 - e2W * Math.sin(wgsLat) * Math.sin(wgsLat));
    wgsLat = Math.atan2(z2 + e2W * nuW * Math.sin(wgsLat), p);
  }
  const wgsLon = Math.atan2(y2, x2);

  return { lat: (wgsLat * 180) / Math.PI, lng: (wgsLon * 180) / Math.PI };
}

const DATA_DIR = path.join(process.cwd(), "data", "schools");

// London boroughs for filtering (by name and LA code)
const LONDON_BOROUGHS = new Set([
  "Barking and Dagenham", "Barnet", "Bexley", "Brent", "Bromley",
  "Camden", "City of London", "Croydon", "Ealing", "Enfield",
  "Greenwich", "Hackney", "Hammersmith and Fulham", "Haringey", "Harrow",
  "Havering", "Hillingdon", "Hounslow", "Islington",
  "Kensington and Chelsea", "Kingston upon Thames", "Lambeth", "Lewisham",
  "Merton", "Newham", "Redbridge", "Richmond upon Thames", "Southwark",
  "Sutton", "Tower Hamlets", "Waltham Forest", "Wandsworth", "Westminster",
]);

const LONDON_LA_CODES = new Set([
  "201", "202", "203", "204", "205", "206", "207", "208", "209", "210",
  "211", "212", "213", "301", "302", "303", "304", "305", "306", "307",
  "308", "309", "310", "311", "312", "313", "314", "315", "316", "317",
  "318", "319", "320",
]);

function main() {
  const giasPath = path.join(DATA_DIR, "gias-establishments.csv");
  const ofstedPath = path.join(DATA_DIR, "ofsted-mi.csv");

  if (!fs.existsSync(giasPath)) {
    console.error(`GIAS file not found: ${giasPath}`);
    console.log("Run 05-download-schools.ts for instructions.");
    process.exit(1);
  }

  const db = getScriptDb();
  initSchema(db);

  // Parse GIAS
  console.log("Parsing GIAS data...");
  const giasRaw = fs.readFileSync(giasPath, "utf-8");
  const giasRecords = parse(giasRaw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  // Parse Ofsted MI if available
  let ofstedMap = new Map<number, { rating: string; date: string }>();
  if (fs.existsSync(ofstedPath)) {
    console.log("Parsing Ofsted MI data...");
    const ofstedRaw = fs.readFileSync(ofstedPath, "utf-8");
    const ofstedRecords = parse(ofstedRaw, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    });
    for (const r of ofstedRecords) {
      const urn = parseInt(r["URN"], 10);
      if (!urn) continue;
      ofstedMap.set(urn, {
        rating: r["Overall effectiveness"] || r["OverallEffectiveness"] || "",
        date: r["Inspection end date"] || r["InspectionDate"] || "",
      });
    }
    console.log(`  Loaded ${ofstedMap.size} Ofsted inspections.`);
  }

  // Filter to London, open schools only
  const londonSchools = giasRecords.filter((r: Record<string, string>) => {
    const laName = r["LA (name)"] || r["LocalAuthority"] || "";
    const laCode = r["LA (code)"] || "";
    const status = r["EstablishmentStatus (name)"] || r["StatusName"] || "";
    return (LONDON_BOROUGHS.has(laName) || LONDON_LA_CODES.has(laCode)) && status.includes("Open");
  });

  console.log(`Found ${londonSchools.length} open London schools.`);

  // Build coordinate map from GIAS Easting/Northing (no external API needed)
  console.log("Converting Easting/Northing to lat/lng...");

  // Insert schools
  const insert = db.prepare(`
    INSERT OR REPLACE INTO schools
      (urn, name, phase, type, postcode, lat, lng, ofsted_rating, last_inspection_date, number_of_pupils, gender, religious_character, website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRtree = db.prepare(`
    INSERT OR REPLACE INTO schools_rtree (id, min_lat, max_lat, min_lng, max_lng)
    VALUES (?, ?, ?, ?, ?)
  `);

  let imported = 0;
  const tx = db.transaction(() => {
    for (const r of londonSchools) {
      const urn = parseInt(r["URN"], 10);
      if (!urn) continue;

      const postcode = r["Postcode"] || "";
      const easting = parseFloat(r["Easting"] || "0");
      const northing = parseFloat(r["Northing"] || "0");
      const geo = osgbToLatLng(easting, northing);
      if (!geo) continue;

      const ofsted = ofstedMap.get(urn);
      const ratingMap: Record<string, string> = {
        "1": "Outstanding",
        "2": "Good",
        "3": "Requires improvement",
        "4": "Inadequate",
      };

      const rawRating = ofsted?.rating || "";
      const rating = ratingMap[rawRating] || rawRating || null;

      insert.run(
        urn,
        r["EstablishmentName"] || r["SchoolName"] || "",
        r["PhaseOfEducation (name)"] || r["Phase"] || "",
        r["TypeOfEstablishment (name)"] || r["Type"] || "",
        postcode,
        geo.lat,
        geo.lng,
        rating,
        ofsted?.date || null,
        parseInt(r["NumberOfPupils"] || "0", 10) || null,
        r["Gender (name)"] || null,
        r["ReligiousCharacter (name)"] || null,
        r["SchoolWebsite"] || null
      );

      insertRtree.run(urn, geo.lat, geo.lat, geo.lng, geo.lng);
      imported++;
    }
  });

  tx();

  console.log(`\nImported ${imported} London schools.`);
  db.close();
}

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
