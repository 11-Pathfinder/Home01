/**
 * Seed the database with realistic demo data for London.
 * Used when external data sources are unavailable (e.g. no network access).
 *
 * Run: npx tsx scripts/seed-demo-data.ts
 */
import { getScriptDb, initSchema } from "./utils/db";

// Sample London postcodes with approximate lat/lng
const LONDON_POSTCODES = [
  { postcode: "E1 6AN", lat: 51.5152, lng: -0.0722, outcode: "E1", district: "TOWER HAMLETS", lsoa_code: "E01004200", ward: "Whitechapel" },
  { postcode: "E1 6QR", lat: 51.5168, lng: -0.0695, outcode: "E1", district: "TOWER HAMLETS", lsoa_code: "E01004200", ward: "Whitechapel" },
  { postcode: "E1 7PT", lat: 51.5180, lng: -0.0660, outcode: "E1", district: "TOWER HAMLETS", lsoa_code: "E01004201", ward: "Stepney Green" },
  { postcode: "SW1A 1AA", lat: 51.5014, lng: -0.1419, outcode: "SW1A", district: "WESTMINSTER", lsoa_code: "E01004736", ward: "St James's" },
  { postcode: "SW1A 2AA", lat: 51.5010, lng: -0.1416, outcode: "SW1A", district: "WESTMINSTER", lsoa_code: "E01004736", ward: "St James's" },
  { postcode: "SW1A 2PW", lat: 51.5033, lng: -0.1276, outcode: "SW1A", district: "WESTMINSTER", lsoa_code: "E01004737", ward: "St James's" },
  { postcode: "EC2A 1NT", lat: 51.5225, lng: -0.0849, outcode: "EC2A", district: "HACKNEY", lsoa_code: "E01001769", ward: "Hoxton East" },
  { postcode: "EC2A 2BB", lat: 51.5231, lng: -0.0830, outcode: "EC2A", district: "HACKNEY", lsoa_code: "E01001769", ward: "Hoxton East" },
  { postcode: "N1 9GU", lat: 51.5369, lng: -0.1035, outcode: "N1", district: "ISLINGTON", lsoa_code: "E01002704", ward: "Canonbury" },
  { postcode: "N1 9BE", lat: 51.5362, lng: -0.1040, outcode: "N1", district: "ISLINGTON", lsoa_code: "E01002704", ward: "Canonbury" },
  { postcode: "SE1 9SG", lat: 51.5046, lng: -0.0889, outcode: "SE1", district: "SOUTHWARK", lsoa_code: "E01003940", ward: "Borough" },
  { postcode: "SE1 7PB", lat: 51.5055, lng: -0.0862, outcode: "SE1", district: "SOUTHWARK", lsoa_code: "E01003940", ward: "Borough" },
  { postcode: "W1D 3SE", lat: 51.5136, lng: -0.1319, outcode: "W1D", district: "WESTMINSTER", lsoa_code: "E01004760", ward: "West End" },
  { postcode: "W1F 0TH", lat: 51.5138, lng: -0.1358, outcode: "W1F", district: "WESTMINSTER", lsoa_code: "E01004760", ward: "West End" },
  { postcode: "SW3 1AA", lat: 51.4915, lng: -0.1596, outcode: "SW3", district: "KENSINGTON AND CHELSEA", lsoa_code: "E01002450", ward: "Chelsea Riverside" },
  { postcode: "SW3 3LR", lat: 51.4905, lng: -0.1610, outcode: "SW3", district: "KENSINGTON AND CHELSEA", lsoa_code: "E01002450", ward: "Chelsea Riverside" },
  { postcode: "W8 5SE", lat: 51.5005, lng: -0.1916, outcode: "W8", district: "KENSINGTON AND CHELSEA", lsoa_code: "E01002466", ward: "Campden" },
  { postcode: "NW1 6XE", lat: 51.5340, lng: -0.1448, outcode: "NW1", district: "CAMDEN", lsoa_code: "E01000890", ward: "Regent's Park" },
  { postcode: "NW3 2QG", lat: 51.5552, lng: -0.1740, outcode: "NW3", district: "CAMDEN", lsoa_code: "E01000910", ward: "Hampstead Town" },
  { postcode: "E14 5AB", lat: 51.5054, lng: -0.0235, outcode: "E14", district: "TOWER HAMLETS", lsoa_code: "E01004230", ward: "Canary Wharf" },
  { postcode: "E14 9RZ", lat: 51.5070, lng: -0.0208, outcode: "E14", district: "TOWER HAMLETS", lsoa_code: "E01004231", ward: "Canary Wharf" },
  { postcode: "SE10 8EW", lat: 51.4826, lng: -0.0077, outcode: "SE10", district: "GREENWICH", lsoa_code: "E01001488", ward: "Greenwich West" },
  { postcode: "SW11 1HT", lat: 51.4622, lng: -0.1668, outcode: "SW11", district: "WANDSWORTH", lsoa_code: "E01004480", ward: "Battersea" },
  { postcode: "E2 0SY", lat: 51.5294, lng: -0.0583, outcode: "E2", district: "TOWER HAMLETS", lsoa_code: "E01004210", ward: "Bethnal Green" },
  { postcode: "N7 8JL", lat: 51.5526, lng: -0.1085, outcode: "N7", district: "ISLINGTON", lsoa_code: "E01002730", ward: "Holloway" },
  { postcode: "W2 1JR", lat: 51.5155, lng: -0.1780, outcode: "W2", district: "WESTMINSTER", lsoa_code: "E01004750", ward: "Bayswater" },
  { postcode: "SW7 2BX", lat: 51.4966, lng: -0.1764, outcode: "SW7", district: "KENSINGTON AND CHELSEA", lsoa_code: "E01002455", ward: "Queen's Gate" },
  { postcode: "SE16 5HW", lat: 51.4935, lng: -0.0469, outcode: "SE16", district: "SOUTHWARK", lsoa_code: "E01003960", ward: "Rotherhithe" },
  { postcode: "E8 1HE", lat: 51.5432, lng: -0.0557, outcode: "E8", district: "HACKNEY", lsoa_code: "E01001790", ward: "Dalston" },
  { postcode: "SW4 7AA", lat: 51.4620, lng: -0.1369, outcode: "SW4", district: "LAMBETH", lsoa_code: "E01003095", ward: "Clapham Common" },
];

// Property type weights: F=Flat (most common in London), T=Terraced, S=Semi, D=Detached
const PROPERTY_TYPES = ["F", "F", "F", "F", "T", "T", "S", "D"];
const TENURE = ["L", "L", "L", "F"]; // Leasehold more common for flats

// Base price ranges by district (approximate, in £)
const DISTRICT_PRICE_BASE: Record<string, { flat: number; house: number }> = {
  "TOWER HAMLETS": { flat: 420000, house: 680000 },
  "WESTMINSTER": { flat: 850000, house: 2200000 },
  "HACKNEY": { flat: 450000, house: 750000 },
  "ISLINGTON": { flat: 520000, house: 1100000 },
  "SOUTHWARK": { flat: 440000, house: 720000 },
  "KENSINGTON AND CHELSEA": { flat: 1100000, house: 3500000 },
  "CAMDEN": { flat: 580000, house: 1400000 },
  "GREENWICH": { flat: 340000, house: 550000 },
  "WANDSWORTH": { flat: 420000, house: 850000 },
  "LAMBETH": { flat: 400000, house: 700000 },
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePrice(district: string, propType: string, year: number): number {
  const base = DISTRICT_PRICE_BASE[district] || { flat: 400000, house: 700000 };
  const isFlat = propType === "F";
  let price = isFlat ? base.flat : base.house;

  // Year-over-year growth (~3-5% per year from 2021 base)
  const yearFactor = 1 + (year - 2021) * (0.03 + Math.random() * 0.02);
  price *= yearFactor;

  // Random variance ±20%
  price *= 0.8 + Math.random() * 0.4;

  return Math.round(price / 1000) * 1000; // Round to nearest £1000
}

function generateFloorArea(propType: string): number {
  switch (propType) {
    case "F": return randomInt(35, 95);
    case "T": return randomInt(75, 140);
    case "S": return randomInt(80, 160);
    case "D": return randomInt(100, 250);
    default: return randomInt(50, 100);
  }
}

async function main() {
  const db = getScriptDb();
  initSchema(db);

  console.log("Seeding demo data...\n");

  // 1. Insert postcodes
  const insertPostcode = db.prepare(`
    INSERT OR IGNORE INTO postcodes (postcode, lat, lng, lsoa_code, lsoa_name, ward_name, district, outcode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRtree = db.prepare(`
    INSERT OR IGNORE INTO postcodes_rtree (id, min_lat, max_lat, min_lng, max_lng)
    VALUES (?, ?, ?, ?, ?)
  `);

  const txPostcodes = db.transaction(() => {
    LONDON_POSTCODES.forEach((pc, i) => {
      insertPostcode.run(
        pc.postcode, pc.lat, pc.lng, pc.lsoa_code,
        `${pc.ward} - ${pc.district}`, pc.ward, pc.district, pc.outcode
      );
      insertRtree.run(i + 1, pc.lat, pc.lat, pc.lng, pc.lng);
    });
  });
  txPostcodes();
  console.log(`Inserted ${LONDON_POSTCODES.length} postcodes.`);

  // 2. Insert price paid records
  const insertPP = db.prepare(`
    INSERT OR IGNORE INTO price_paid
      (id, price, date_of_transfer, postcode, property_type, new_build, tenure, paon, saon, street, district)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let ppCount = 0;
  const streets = ["HIGH STREET", "CHURCH ROAD", "STATION ROAD", "VICTORIA ROAD", "KING STREET",
    "QUEEN STREET", "LONDON ROAD", "PARK ROAD", "MANOR ROAD", "THE GROVE",
    "MILL LANE", "ALBION ROAD", "CAMBRIDGE ROAD", "COMMERCIAL ROAD", "BRICK LANE"];

  const txPP = db.transaction(() => {
    for (const pc of LONDON_POSTCODES) {
      // Generate 15-40 transactions per postcode across 5 years
      const numTransactions = randomInt(15, 40);
      for (let t = 0; t < numTransactions; t++) {
        const year = randomInt(2021, 2025);
        const month = String(randomInt(1, 12)).padStart(2, "0");
        const day = String(randomInt(1, 28)).padStart(2, "0");
        const propType = randomChoice(PROPERTY_TYPES);
        const price = generatePrice(pc.district, propType, year);
        const id = `{${crypto.randomUUID().toUpperCase()}}`;

        insertPP.run(
          id,
          price,
          `${year}-${month}-${day}`,
          pc.postcode,
          propType,
          Math.random() < 0.1 ? "Y" : "N",
          propType === "F" ? randomChoice(TENURE) : "F",
          String(randomInt(1, 150)),
          propType === "F" ? `FLAT ${randomInt(1, 20)}` : "",
          randomChoice(streets),
          pc.district
        );
        ppCount++;
      }
    }
  });
  txPP();
  console.log(`Inserted ${ppCount} price paid records.`);

  // 3. Insert EPC records (to enable £/sqm)
  const insertEPC = db.prepare(`
    INSERT OR IGNORE INTO epc
      (lmk_key, address, postcode, total_floor_area, current_energy_rating, property_type, built_form, construction_age_band)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let epcCount = 0;
  const energyRatings = ["A", "B", "B", "C", "C", "C", "D", "D", "D", "D", "E", "E", "F"];
  const ageBands = ["England and Wales: before 1900", "England and Wales: 1900-1929", "England and Wales: 1930-1949",
    "England and Wales: 1950-1966", "England and Wales: 1967-1975", "England and Wales: 1976-1982",
    "England and Wales: 1983-1990", "England and Wales: 1991-1995", "England and Wales: 1996-2002",
    "England and Wales: 2003-2006", "England and Wales: 2007-2011", "England and Wales: 2012 onwards"];

  const txEPC = db.transaction(() => {
    for (const pc of LONDON_POSTCODES) {
      const numEpc = randomInt(10, 30);
      for (let e = 0; e < numEpc; e++) {
        const paon = String(randomInt(1, 150));
        const propType = randomChoice(PROPERTY_TYPES);
        const floorArea = generateFloorArea(propType);
        const builtForm = propType === "F" ? "Enclosed Mid-Floor Flat" :
          propType === "T" ? "Mid-Terrace" :
          propType === "S" ? "Semi-Detached" : "Detached";
        const epcPropType = propType === "F" ? "Flat" :
          propType === "T" ? "House" :
          propType === "S" ? "House" : "House";

        insertEPC.run(
          crypto.randomUUID(),
          `${paon} ${randomChoice(streets)}, LONDON`,
          pc.postcode,
          floorArea,
          randomChoice(energyRatings),
          epcPropType,
          builtForm,
          randomChoice(ageBands)
        );
        epcCount++;
      }
    }
  });
  txEPC();
  console.log(`Inserted ${epcCount} EPC records.`);

  // 4. Insert schools
  const insertSchool = db.prepare(`
    INSERT OR IGNORE INTO schools
      (urn, name, phase, type, postcode, lat, lng, ofsted_rating, last_inspection_date, number_of_pupils, gender, religious_character, website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSchoolRtree = db.prepare(`
    INSERT OR IGNORE INTO schools_rtree (id, min_lat, max_lat, min_lng, max_lng)
    VALUES (?, ?, ?, ?, ?)
  `);

  const schoolNames = [
    ["St Mary's", "St Paul's", "Holy Trinity", "All Saints", "Christ Church"],
    ["Oakwood", "Riverside", "Greenfield", "Parkview", "Hillside"],
    ["Academy", "Primary School", "Secondary School", "School", "CofE School"],
  ];
  const ofstedRatings = ["Outstanding", "Good", "Good", "Good", "Good", "Requires improvement", "Requires improvement"];
  const phases = ["Primary", "Primary", "Primary", "Secondary", "Secondary"];

  let schoolCount = 0;
  const txSchools = db.transaction(() => {
    for (const pc of LONDON_POSTCODES) {
      const numSchools = randomInt(2, 5);
      for (let s = 0; s < numSchools; s++) {
        const urn = 100000 + schoolCount;
        const phase = randomChoice(phases);
        const name = `${randomChoice(schoolNames[0])} ${randomChoice(schoolNames[1])} ${phase === "Primary" ? "Primary School" : "Academy"}`;
        const lat = pc.lat + (Math.random() - 0.5) * 0.015;
        const lng = pc.lng + (Math.random() - 0.5) * 0.02;

        insertSchool.run(
          urn, name, phase, "Academy", pc.postcode,
          lat, lng,
          randomChoice(ofstedRatings),
          `${randomInt(2020, 2024)}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`,
          phase === "Primary" ? randomInt(200, 500) : randomInt(600, 1500),
          "Mixed", Math.random() < 0.3 ? "Church of England" : null,
          null
        );
        insertSchoolRtree.run(urn, lat, lat, lng, lng);
        schoolCount++;
      }
    }
  });
  txSchools();
  console.log(`Inserted ${schoolCount} schools.`);

  // 5. Insert demographics (IMD by LSOA)
  const insertDemo = db.prepare(`
    INSERT OR IGNORE INTO lsoa_demographics
      (lsoa_code, lsoa_name, imd_rank, imd_decile, income_rank, employment_rank, education_rank,
       health_rank, crime_rank, housing_rank, environment_rank, population, median_age)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const uniqueLsoas = [...new Set(LONDON_POSTCODES.map((p) => p.lsoa_code))];
  const txDemo = db.transaction(() => {
    for (const lsoa of uniqueLsoas) {
      const pc = LONDON_POSTCODES.find((p) => p.lsoa_code === lsoa)!;
      const imdDecile = randomInt(1, 10);
      const imdRank = imdDecile * randomInt(2500, 3500);

      insertDemo.run(
        lsoa,
        `${pc.ward} - ${pc.district}`,
        imdRank,
        imdDecile,
        randomInt(1000, 30000), // income
        randomInt(1000, 30000), // employment
        randomInt(1000, 30000), // education
        randomInt(1000, 30000), // health
        randomInt(1000, 30000), // crime
        randomInt(1000, 30000), // housing
        randomInt(1000, 30000), // environment
        randomInt(1200, 3500),  // population
        randomInt(28, 42) + Math.random() * 5, // median age
      );
    }
  });
  txDemo();
  console.log(`Inserted ${uniqueLsoas.length} LSOA demographics records.`);

  // 6. Compute price per sqm
  console.log("\nComputing price per sqm...");
  const ppRecords = db.prepare(`
    SELECT pp.id, pp.price, pp.date_of_transfer, pp.postcode, pp.property_type, pp.paon,
           e.lmk_key, e.total_floor_area, e.address
    FROM price_paid pp
    INNER JOIN epc e ON pp.postcode = e.postcode
    WHERE e.total_floor_area > 0
  `).all() as { id: string; price: number; date_of_transfer: string; postcode: string; property_type: string; paon: string; lmk_key: string; total_floor_area: number; address: string }[];

  const insertPsm = db.prepare(`
    INSERT OR IGNORE INTO price_per_sqm
      (price_paid_id, epc_lmk_key, price, floor_area, price_per_sqm, date_of_transfer, postcode, property_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let psmCount = 0;
  const seen = new Set<string>();
  const txPsm = db.transaction(() => {
    for (const r of ppRecords) {
      const key = `${r.id}-${r.lmk_key}`;
      if (seen.has(key)) continue;

      // Simple match: same postcode, check if house number matches
      const saleNum = r.paon?.match(/^(\d+)/)?.[1];
      const epcNum = r.address?.match(/^(\d+)/)?.[1];
      if (saleNum && epcNum && saleNum !== epcNum) continue;

      const psm = Math.round(r.price / r.total_floor_area);
      if (psm < 500 || psm > 50000) continue;

      insertPsm.run(r.id, r.lmk_key, r.price, r.total_floor_area, psm, r.date_of_transfer, r.postcode, r.property_type);
      seen.add(key);
      psmCount++;
    }
  });
  txPsm();
  console.log(`Computed ${psmCount} price-per-sqm records.`);

  // Print summary
  console.log("\n=== Database Summary ===");
  const tables = ["postcodes", "price_paid", "epc", "price_per_sqm", "schools", "lsoa_demographics"];
  for (const table of tables) {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
    console.log(`  ${table}: ${row.count} records`);
  }

  db.close();
  console.log("\nDemo data seeded successfully!");
}

main().catch(console.error);
