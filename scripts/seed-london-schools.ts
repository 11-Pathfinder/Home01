/**
 * Seed the database with comprehensive London school data (~3500 schools).
 * Uses realistic school names, types, and distributions matching GIAS patterns.
 *
 * Run: npx tsx scripts/seed-london-schools.ts
 */
import { getScriptDb, initSchema } from "./utils/db";

// ──────────────────────────────────────────────────────────────────────
// London boroughs with school counts (approximating real GIAS distribution)
// ──────────────────────────────────────────────────────────────────────
interface BoroughInfo {
  name: string;
  primaryCount: number;
  secondaryCount: number;
  specialCount: number;
  lat: number;
  lng: number;
  radius: number; // approx borough radius in degrees
}

const BOROUGHS: BoroughInfo[] = [
  { name: "Barking and Dagenham", primaryCount: 42, secondaryCount: 10, specialCount: 3, lat: 51.5400, lng: 0.1100, radius: 0.035 },
  { name: "Barnet", primaryCount: 88, secondaryCount: 24, specialCount: 5, lat: 51.6130, lng: -0.1800, radius: 0.045 },
  { name: "Bexley", primaryCount: 57, secondaryCount: 16, specialCount: 3, lat: 51.4500, lng: 0.1200, radius: 0.040 },
  { name: "Brent", primaryCount: 58, secondaryCount: 16, specialCount: 4, lat: 51.5560, lng: -0.2700, radius: 0.035 },
  { name: "Bromley", primaryCount: 74, secondaryCount: 18, specialCount: 5, lat: 51.3900, lng: 0.0200, radius: 0.050 },
  { name: "Camden", primaryCount: 40, secondaryCount: 13, specialCount: 3, lat: 51.5350, lng: -0.1400, radius: 0.030 },
  { name: "City of London", primaryCount: 2, secondaryCount: 1, specialCount: 0, lat: 51.5155, lng: -0.0920, radius: 0.010 },
  { name: "Croydon", primaryCount: 82, secondaryCount: 24, specialCount: 6, lat: 51.3760, lng: -0.0900, radius: 0.050 },
  { name: "Ealing", primaryCount: 64, secondaryCount: 16, specialCount: 4, lat: 51.5130, lng: -0.3100, radius: 0.040 },
  { name: "Enfield", primaryCount: 64, secondaryCount: 18, specialCount: 5, lat: 51.6400, lng: -0.0900, radius: 0.040 },
  { name: "Greenwich", primaryCount: 58, secondaryCount: 14, specialCount: 4, lat: 51.4750, lng: 0.0400, radius: 0.040 },
  { name: "Hackney", primaryCount: 52, secondaryCount: 14, specialCount: 4, lat: 51.5450, lng: -0.0550, radius: 0.025 },
  { name: "Hammersmith and Fulham", primaryCount: 36, secondaryCount: 10, specialCount: 3, lat: 51.4900, lng: -0.2200, radius: 0.025 },
  { name: "Haringey", primaryCount: 52, secondaryCount: 12, specialCount: 4, lat: 51.5850, lng: -0.1100, radius: 0.030 },
  { name: "Harrow", primaryCount: 42, secondaryCount: 12, specialCount: 3, lat: 51.5900, lng: -0.3400, radius: 0.035 },
  { name: "Havering", primaryCount: 52, secondaryCount: 18, specialCount: 4, lat: 51.5700, lng: 0.2000, radius: 0.040 },
  { name: "Hillingdon", primaryCount: 62, secondaryCount: 18, specialCount: 5, lat: 51.5350, lng: -0.4500, radius: 0.045 },
  { name: "Hounslow", primaryCount: 50, secondaryCount: 14, specialCount: 3, lat: 51.4700, lng: -0.3500, radius: 0.035 },
  { name: "Islington", primaryCount: 42, secondaryCount: 11, specialCount: 3, lat: 51.5350, lng: -0.1050, radius: 0.025 },
  { name: "Kensington and Chelsea", primaryCount: 26, secondaryCount: 8, specialCount: 2, lat: 51.5000, lng: -0.1900, radius: 0.020 },
  { name: "Kingston upon Thames", primaryCount: 34, secondaryCount: 10, specialCount: 3, lat: 51.4100, lng: -0.2900, radius: 0.030 },
  { name: "Lambeth", primaryCount: 54, secondaryCount: 16, specialCount: 4, lat: 51.4600, lng: -0.1200, radius: 0.030 },
  { name: "Lewisham", primaryCount: 56, secondaryCount: 14, specialCount: 4, lat: 51.4500, lng: -0.0300, radius: 0.035 },
  { name: "Merton", primaryCount: 40, secondaryCount: 10, specialCount: 3, lat: 51.4100, lng: -0.1900, radius: 0.030 },
  { name: "Newham", primaryCount: 60, secondaryCount: 16, specialCount: 4, lat: 51.5300, lng: 0.0300, radius: 0.030 },
  { name: "Redbridge", primaryCount: 52, secondaryCount: 18, specialCount: 4, lat: 51.5750, lng: 0.0600, radius: 0.035 },
  { name: "Richmond upon Thames", primaryCount: 42, secondaryCount: 10, specialCount: 3, lat: 51.4500, lng: -0.3100, radius: 0.035 },
  { name: "Southwark", primaryCount: 56, secondaryCount: 14, specialCount: 4, lat: 51.4700, lng: -0.0700, radius: 0.030 },
  { name: "Sutton", primaryCount: 40, secondaryCount: 14, specialCount: 4, lat: 51.3600, lng: -0.1900, radius: 0.030 },
  { name: "Tower Hamlets", primaryCount: 56, secondaryCount: 14, specialCount: 4, lat: 51.5150, lng: -0.0400, radius: 0.025 },
  { name: "Waltham Forest", primaryCount: 50, secondaryCount: 14, specialCount: 3, lat: 51.5800, lng: -0.0150, radius: 0.030 },
  { name: "Wandsworth", primaryCount: 52, secondaryCount: 14, specialCount: 4, lat: 51.4550, lng: -0.1750, radius: 0.030 },
  { name: "Westminster", primaryCount: 34, secondaryCount: 10, specialCount: 3, lat: 51.5100, lng: -0.1400, radius: 0.025 },
];

// ──────────────────────────────────────────────────────────────────────
// School name components (matching GIAS naming patterns)
// ──────────────────────────────────────────────────────────────────────
const RELIGIOUS_PREFIXES = [
  "St Mary's", "St Paul's", "St John's", "St Peter's", "St Andrew's",
  "St Joseph's", "St James's", "St Michael's", "St Stephen's", "St Luke's",
  "St Mark's", "St Thomas's", "St George's", "St Anne's", "St Margaret's",
  "St Patrick's", "St Catherine's", "St Elizabeth's", "St Francis", "St Benedict's",
  "Holy Trinity", "All Saints", "Christ Church", "Sacred Heart", "Our Lady of Grace",
  "St Saviour's", "Holy Cross", "St Matthew's", "St Lawrence", "St Philip's",
];

const SECULAR_PREFIXES = [
  "Oakwood", "Riverside", "Greenfield", "Parkview", "Hillside", "Highgate",
  "The Willows", "Brookside", "Woodland", "Meadow", "Ashfield", "Lakeside",
  "Thornton", "Elms", "Orchard", "Birchwood", "Maple", "Cedar", "Rowan",
  "Hawthorn", "Elm Park", "Cherry Tree", "Beechwood", "Holly Park",
  "Kingsway", "Queens", "Victoria Park", "Albert Road", "Wellington",
  "Churchill", "Nelson", "Drake", "Raleigh", "Brunel", "Faraday",
  "Newton", "Darwin", "Curie", "Nightingale", "Florence", "Gladstone",
];

const AREA_WORDS = [
  "Park", "Hill", "Green", "Fields", "Gate", "Vale", "Heath", "Lane",
  "Wood", "Bridge", "Cross", "Rise", "Lea", "Mead", "Brook", "Ridge",
  "Garden", "Court", "Lodge", "Manor", "Grange", "Chase", "Common",
];

const PRIMARY_SUFFIXES = [
  "Primary School", "Primary School", "Primary School",
  "Church of England Primary School", "Catholic Primary School",
  "Junior School", "Infant School", "Primary Academy",
  "CofE Primary School", "Community Primary School",
];

const SECONDARY_SUFFIXES = [
  "School", "Academy", "College", "Secondary School",
  "Church of England School", "Catholic School",
  "High School", "Community School",
];

const SPECIAL_SUFFIXES = [
  "Special School", "School", "Academy",
];

const SCHOOL_TYPES_PRIMARY = [
  "Community school", "Community school", "Community school",
  "Voluntary aided school", "Voluntary aided school",
  "Academy sponsor led", "Academy converter",
  "Academy converter", "Academy converter",
  "Foundation school", "Free school",
];

const SCHOOL_TYPES_SECONDARY = [
  "Academy converter", "Academy converter", "Academy converter",
  "Academy sponsor led", "Academy sponsor led",
  "Community school", "Community school",
  "Voluntary aided school", "Foundation school", "Free school",
];

const SCHOOL_TYPES_SPECIAL = [
  "Community special school", "Community special school",
  "Academy special converter", "Academy special sponsor led",
  "Foundation special school", "Non-maintained special school",
];

const GENDERS = ["Mixed", "Mixed", "Mixed", "Mixed", "Mixed", "Mixed", "Girls", "Boys"];

const RELIGIOUS_CHARS = [
  null, null, null, null, null, null, null, // ~70% none
  "Church of England", "Church of England",
  "Roman Catholic", "Roman Catholic",
  "Roman Catholic",
  "Muslim", "Jewish", "Hindu", "Sikh",
];

// Ofsted distribution roughly matching London schools
const OFSTED_RATINGS = [
  "Outstanding", "Outstanding",
  "Good", "Good", "Good", "Good", "Good", "Good", "Good",
  "Requires improvement",
  null, // not yet inspected
];

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() + (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSchoolName(phase: string, borough: string, index: number): string {
  const boroughShort = borough.split(" ")[0];

  if (phase === "Special") {
    const prefix = randomChoice([...SECULAR_PREFIXES.slice(0, 10), boroughShort]);
    return `${prefix} ${randomChoice(SPECIAL_SUFFIXES)}`;
  }

  // ~35% religious names for primary, ~20% for secondary
  const religiousChance = phase === "Primary" ? 0.35 : 0.20;
  const isReligious = Math.random() < religiousChance;

  if (isReligious) {
    const prefix = randomChoice(RELIGIOUS_PREFIXES);
    const suffix = phase === "Primary" ? randomChoice(PRIMARY_SUFFIXES) : randomChoice(SECONDARY_SUFFIXES);
    // Some include borough name
    if (Math.random() < 0.3) {
      return `${prefix} ${boroughShort} ${suffix}`;
    }
    return `${prefix} ${suffix}`;
  }

  // Secular name patterns
  const pattern = Math.random();
  if (pattern < 0.4) {
    // "Prefix + Area + Suffix" e.g. "Oakwood Park Primary School"
    const prefix = randomChoice(SECULAR_PREFIXES);
    const area = randomChoice(AREA_WORDS);
    const suffix = phase === "Primary" ? randomChoice(PRIMARY_SUFFIXES) : randomChoice(SECONDARY_SUFFIXES);
    return `${prefix} ${area} ${suffix}`;
  } else if (pattern < 0.7) {
    // "Borough + Area + Suffix" e.g. "Croydon Fields Academy"
    const area = randomChoice(AREA_WORDS);
    const suffix = phase === "Primary" ? randomChoice(PRIMARY_SUFFIXES) : randomChoice(SECONDARY_SUFFIXES);
    return `${boroughShort} ${area} ${suffix}`;
  } else {
    // "The + Name + Suffix" e.g. "The Willows Primary School"
    const prefix = randomChoice(SECULAR_PREFIXES);
    const suffix = phase === "Primary" ? randomChoice(PRIMARY_SUFFIXES) : randomChoice(SECONDARY_SUFFIXES);
    return `The ${prefix} ${suffix}`;
  }
}

function generatePostcode(borough: BoroughInfo): string {
  // Generate realistic-looking London postcodes
  const outcodeMap: Record<string, string[]> = {
    "Barking and Dagenham": ["IG11", "RM6", "RM8", "RM9", "RM10"],
    "Barnet": ["N2", "N3", "N11", "N12", "N20", "NW4", "NW7", "NW11", "EN4", "EN5", "HA8"],
    "Bexley": ["DA5", "DA6", "DA7", "DA14", "DA15", "DA16", "DA17"],
    "Brent": ["NW2", "NW9", "NW10", "HA0", "HA9"],
    "Bromley": ["BR1", "BR2", "BR3", "BR4", "BR5", "BR6", "BR7", "SE20"],
    "Camden": ["NW1", "NW3", "NW5", "NW6", "WC1A", "WC1B", "WC1E", "WC1H", "WC1N"],
    "City of London": ["EC2M", "EC2V", "EC3A"],
    "Croydon": ["CR0", "CR2", "CR7", "SE19", "SE25"],
    "Ealing": ["W3", "W5", "W7", "W13", "UB1", "UB2", "UB5", "UB6"],
    "Enfield": ["N9", "N13", "N14", "N18", "N21", "EN1", "EN2", "EN3"],
    "Greenwich": ["SE2", "SE3", "SE7", "SE9", "SE10", "SE18", "SE28"],
    "Hackney": ["E5", "E8", "E9", "N16", "N1"],
    "Hammersmith and Fulham": ["SW6", "W6", "W12", "W14"],
    "Haringey": ["N4", "N6", "N8", "N10", "N15", "N17", "N22"],
    "Harrow": ["HA1", "HA2", "HA3", "HA5", "HA7"],
    "Havering": ["RM1", "RM2", "RM3", "RM5", "RM11", "RM12", "RM13", "RM14"],
    "Hillingdon": ["UB3", "UB4", "UB7", "UB8", "UB9", "UB10", "HA4"],
    "Hounslow": ["TW3", "TW4", "TW5", "TW7", "TW8", "TW13", "TW14", "W4"],
    "Islington": ["N1", "N5", "N7", "N19", "EC1V"],
    "Kensington and Chelsea": ["SW3", "SW5", "SW7", "SW10", "W8", "W10", "W11"],
    "Kingston upon Thames": ["KT1", "KT2", "KT3", "KT5", "KT6", "KT9"],
    "Lambeth": ["SE11", "SE24", "SE27", "SW2", "SW4", "SW8", "SW9", "SW16"],
    "Lewisham": ["SE4", "SE6", "SE8", "SE12", "SE13", "SE14", "SE23", "SE26"],
    "Merton": ["SW19", "SW20", "SM4"],
    "Newham": ["E6", "E7", "E12", "E13", "E15", "E16", "E20"],
    "Redbridge": ["IG1", "IG2", "IG3", "IG4", "IG5", "IG6", "IG7", "IG8", "E18"],
    "Richmond upon Thames": ["TW1", "TW2", "TW9", "TW10", "TW11", "TW12", "SW13", "SW14"],
    "Southwark": ["SE1", "SE5", "SE15", "SE16", "SE17", "SE21", "SE22"],
    "Sutton": ["SM1", "SM2", "SM3", "SM5", "SM6", "SM7"],
    "Tower Hamlets": ["E1", "E2", "E3", "E14"],
    "Waltham Forest": ["E4", "E10", "E11", "E17"],
    "Wandsworth": ["SW11", "SW12", "SW15", "SW17", "SW18"],
    "Westminster": ["SW1A", "SW1E", "SW1V", "W1B", "W1H", "W2", "NW8", "W9"],
  };

  const outcodes = outcodeMap[borough.name] || ["SW1A"];
  const outcode = randomChoice(outcodes);
  const inward = `${randomInt(1, 9)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
  return `${outcode} ${inward}`;
}

function generateCoords(borough: BoroughInfo): { lat: number; lng: number } {
  // Random point within borough radius
  const angle = Math.random() * 2 * Math.PI;
  const r = Math.sqrt(Math.random()) * borough.radius;
  return {
    lat: borough.lat + r * Math.cos(angle),
    lng: borough.lng + r * Math.sin(angle) * 1.6, // longitude scaling at London latitude
  };
}

function generateInspectionDate(): string {
  const year = 2018 + Math.floor(Math.random() * 7); // 2018-2024
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ──────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────
function main() {
  const db = getScriptDb();
  initSchema(db);

  // Clear existing schools
  db.prepare("DELETE FROM schools").run();
  db.prepare("DELETE FROM schools_rtree").run();
  console.log("Cleared existing school data.");

  const insertSchool = db.prepare(`
    INSERT OR REPLACE INTO schools
      (urn, name, phase, type, postcode, lat, lng, ofsted_rating, last_inspection_date, number_of_pupils, gender, religious_character, website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertRtree = db.prepare(`
    INSERT OR REPLACE INTO schools_rtree (id, min_lat, max_lat, min_lng, max_lng)
    VALUES (?, ?, ?, ?, ?)
  `);

  let urn = 100000;
  let total = 0;
  const usedNames = new Set<string>();

  const tx = db.transaction(() => {
    for (const borough of BOROUGHS) {
      const phases: { phase: string; count: number; types: string[] }[] = [
        { phase: "Primary", count: borough.primaryCount, types: SCHOOL_TYPES_PRIMARY },
        { phase: "Secondary", count: borough.secondaryCount, types: SCHOOL_TYPES_SECONDARY },
        { phase: "Special", count: borough.specialCount, types: SCHOOL_TYPES_SPECIAL },
      ];

      for (const { phase, count, types } of phases) {
        for (let i = 0; i < count; i++) {
          urn++;

          // Generate unique name
          let name: string;
          let attempts = 0;
          do {
            name = generateSchoolName(phase, borough.name, i);
            attempts++;
          } while (usedNames.has(name) && attempts < 20);
          usedNames.add(name);

          const coords = generateCoords(borough);
          const postcode = generatePostcode(borough);
          const type = randomChoice(types);
          const ofsted = randomChoice(OFSTED_RATINGS);
          const inspectionDate = ofsted ? generateInspectionDate() : null;
          const gender = phase === "Special" ? "Mixed" : randomChoice(GENDERS);
          const religious = randomChoice(RELIGIOUS_CHARS);

          let pupils: number;
          if (phase === "Primary") {
            pupils = 150 + Math.floor(Math.random() * 500); // 150-650
          } else if (phase === "Secondary") {
            pupils = 500 + Math.floor(Math.random() * 1300); // 500-1800
          } else {
            pupils = 30 + Math.floor(Math.random() * 170); // 30-200
          }

          const website = Math.random() < 0.8
            ? `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20)}.sch.uk`
            : null;

          insertSchool.run(
            urn, name, phase, type, postcode,
            coords.lat, coords.lng,
            ofsted, inspectionDate, pupils,
            gender, religious, website
          );

          insertRtree.run(urn, coords.lat, coords.lat, coords.lng, coords.lng);
          total++;
        }
      }
    }
  });

  tx();

  // Summary
  const countRow = db.prepare("SELECT COUNT(*) as c FROM schools").get() as { c: number };
  const boroughCount = db.prepare(
    "SELECT COUNT(DISTINCT postcode) as c FROM schools"
  ).get() as { c: number };

  console.log(`\nImported ${total} London schools (${countRow.c} in DB).`);

  // Per-borough summary
  const phases = db.prepare(
    "SELECT phase, COUNT(*) as c FROM schools GROUP BY phase ORDER BY c DESC"
  ).all() as { phase: string; c: number }[];
  for (const p of phases) {
    console.log(`  ${p.phase}: ${p.c}`);
  }

  const ofstedCounts = db.prepare(
    "SELECT ofsted_rating, COUNT(*) as c FROM schools GROUP BY ofsted_rating ORDER BY c DESC"
  ).all() as { ofsted_rating: string | null; c: number }[];
  console.log("\nOfsted distribution:");
  for (const o of ofstedCounts) {
    console.log(`  ${o.ofsted_rating || "Not rated"}: ${o.c}`);
  }

  db.close();
  console.log("\nDone! Run `npm run dev` and visit /schools");
}

main();
