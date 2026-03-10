/**
 * Import EPC CSV data into SQLite.
 * Reads all CSV files in data/epc/ (one per borough) and loads into the epc table.
 *
 * Key fields extracted:
 *  - LMK_KEY: unique certificate identifier
 *  - ADDRESS: full address string
 *  - POSTCODE: for joining with price_paid
 *  - TOTAL_FLOOR_AREA: square metres (the main value we need for £/sqm)
 *  - CURRENT_ENERGY_RATING: A-G
 *  - PROPERTY_TYPE: House/Flat/Bungalow/Maisonette/Park home
 *  - BUILT_FORM: Detached/Semi/Mid-Terrace/End-Terrace/Enclosed
 *  - CONSTRUCTION_AGE_BAND: e.g. "1900-1929"
 *
 * Run: npx tsx scripts/04-import-epc.ts
 */
import fs from "fs";
import path from "path";
import readline from "readline";
import { getScriptDb, initSchema } from "./utils/db";

const DATA_DIR = path.join(process.cwd(), "data", "epc");

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

async function importFile(
  db: ReturnType<typeof getScriptDb>,
  filePath: string
): Promise<number> {
  const filename = path.basename(filePath);
  console.log(`Importing ${filename}...`);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO epc
      (lmk_key, address, postcode, total_floor_area, current_energy_rating, property_type, built_form, construction_age_band)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  let headerMap: Record<string, number> = {};
  let isHeader = true;
  let count = 0;
  const batch: Parameters<typeof insert.run>[] = [];

  const flushBatch = () => {
    const tx = db.transaction(() => {
      for (const params of batch) {
        insert.run(...params);
      }
    });
    tx();
    batch.length = 0;
  };

  for await (const line of rl) {
    if (isHeader) {
      // Parse header to find column indices
      const headers = parseCSVLine(line).map((h) => h.toLowerCase().replace(/-/g, "_"));
      headers.forEach((h, i) => {
        headerMap[h] = i;
      });
      isHeader = false;
      continue;
    }

    const fields = parseCSVLine(line);
    if (fields.length < 5) continue;

    const lmkKey = fields[headerMap["lmk_key"] ?? -1];
    const address = fields[headerMap["address"] ?? headerMap["address1"] ?? -1];
    const postcode = fields[headerMap["postcode"] ?? -1];
    const floorArea = parseFloat(
      fields[headerMap["total_floor_area"] ?? -1] || "0"
    );
    const energyRating = fields[headerMap["current_energy_rating"] ?? -1];
    const propertyType = fields[headerMap["property_type"] ?? -1];
    const builtForm = fields[headerMap["built_form"] ?? -1];
    const constructionAge = fields[headerMap["construction_age_band"] ?? -1];

    // Skip records without key fields
    if (!lmkKey || !postcode) continue;

    // Skip if floor area is unreasonable (< 10sqm or > 1000sqm)
    if (floorArea > 0 && (floorArea < 10 || floorArea > 1000)) continue;

    batch.push([
      lmkKey,
      address || null,
      postcode,
      floorArea > 0 ? floorArea : null,
      energyRating || null,
      propertyType || null,
      builtForm || null,
      constructionAge || null,
    ]);
    count++;

    if (batch.length >= 5000) {
      flushBatch();
    }

    if (count % 50000 === 0) {
      console.log(`  ${filename}: ${count} records processed...`);
    }
  }

  if (batch.length > 0) flushBatch();

  console.log(`  ${filename}: ${count} records imported.`);
  return count;
}

async function main() {
  const db = getScriptDb();
  initSchema(db);

  if (!fs.existsSync(DATA_DIR)) {
    console.error(
      `No data/epc/ directory found. Run 03-download-epc.ts first.`
    );
    process.exit(1);
  }

  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".csv"))
    .sort();

  if (files.length === 0) {
    console.log("No EPC CSV files found in data/epc/.");
    console.log("Run 03-download-epc.ts or manually place CSV files there.");
    console.log("The app will work without EPC data (no £/sqm stats).");
    db.close();
    return;
  }

  let total = 0;
  for (const file of files) {
    total += await importFile(db, path.join(DATA_DIR, file));
  }

  console.log(`\nTotal: ${total} EPC records imported.`);

  const stats = db
    .prepare("SELECT COUNT(*) as count FROM epc WHERE total_floor_area > 0")
    .get() as { count: number };
  console.log(`Records with floor area: ${stats.count}`);

  db.close();
  console.log(
    "\nRun 'npx tsx scripts/10-compute-price-sqm.ts' to compute £/sqm."
  );
}

main().catch(console.error);
