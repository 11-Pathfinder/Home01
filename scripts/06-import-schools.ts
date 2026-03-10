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
import { batchGeocode } from "./utils/geocode";

const DATA_DIR = path.join(process.cwd(), "data", "schools");

// London boroughs for filtering
const LONDON_BOROUGHS = new Set([
  "Barking and Dagenham", "Barnet", "Bexley", "Brent", "Bromley",
  "Camden", "City of London", "Croydon", "Ealing", "Enfield",
  "Greenwich", "Hackney", "Hammersmith and Fulham", "Haringey", "Harrow",
  "Havering", "Hillingdon", "Hounslow", "Islington",
  "Kensington and Chelsea", "Kingston upon Thames", "Lambeth", "Lewisham",
  "Merton", "Newham", "Redbridge", "Richmond upon Thames", "Southwark",
  "Sutton", "Tower Hamlets", "Waltham Forest", "Wandsworth", "Westminster",
]);

async function main() {
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
    const la = r["LA (name)"] || r["LocalAuthority"];
    const status = r["EstablishmentStatus (name)"] || r["StatusName"] || "";
    return LONDON_BOROUGHS.has(la) && status.includes("Open");
  });

  console.log(`Found ${londonSchools.length} open London schools.`);

  // Collect postcodes for geocoding
  const postcodes = londonSchools
    .map((r: Record<string, string>) => r["Postcode"] || "")
    .filter((p: string) => p.length > 0);

  const uniquePostcodes = [...new Set(postcodes)] as string[];
  console.log(`Geocoding ${uniquePostcodes.length} unique postcodes...`);
  const geocoded = await batchGeocode(uniquePostcodes);
  const postcodeMap = new Map<string, { lat: number; lng: number }>();
  for (const g of geocoded) {
    if (g) postcodeMap.set(g.postcode, { lat: g.lat, lng: g.lng });
  }

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
      const geo = postcodeMap.get(postcode);
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

main().catch(console.error);
