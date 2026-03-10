/**
 * Import Land Registry Price Paid CSV data into SQLite.
 * Filters to Greater London only.
 *
 * CSV format (no header): https://www.gov.uk/guidance/about-the-price-paid-data
 * Columns:
 *  0: Transaction unique identifier
 *  1: Price
 *  2: Date of Transfer (YYYY-MM-DD HH:MM)
 *  3: Postcode
 *  4: Property Type (D/S/T/F/O)
 *  5: Old/New (Y/N)
 *  6: Duration (F/L)
 *  7: PAON
 *  8: SAON
 *  9: Street
 * 10: Locality
 * 11: Town/City
 * 12: District
 * 13: County
 * 14: PPD Category (A/B)
 * 15: Record Status (A=Amendment, C=Change, D=Delete)
 *
 * Run: npx tsx scripts/02-import-land-registry.ts
 */
import fs from "fs";
import path from "path";
import readline from "readline";
import { getScriptDb, initSchema } from "./utils/db";

const DATA_DIR = path.join(process.cwd(), "data", "land-registry");

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

async function importFile(db: ReturnType<typeof getScriptDb>, filePath: string): Promise<number> {
  const filename = path.basename(filePath);
  console.log(`Importing ${filename}...`);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO price_paid (id, price, date_of_transfer, postcode, property_type, new_build, tenure, paon, saon, street, district)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  let count = 0;
  let londonCount = 0;
  const batch: string[][] = [];

  const flushBatch = () => {
    const tx = db.transaction(() => {
      for (const fields of batch) {
        insert.run(
          fields[0].replace(/[{}]/g, ""), // Transaction ID (strip braces)
          parseInt(fields[1], 10),         // Price
          fields[2].split(" ")[0],          // Date (just YYYY-MM-DD)
          fields[3],                        // Postcode
          fields[4],                        // Property type
          fields[5],                        // New build
          fields[6],                        // Tenure
          fields[7],                        // PAON
          fields[8],                        // SAON
          fields[9],                        // Street
          fields[12]                        // District (borough)
        );
      }
    });
    tx();
    batch.length = 0;
  };

  for await (const line of rl) {
    count++;
    const fields = parseCSVLine(line);
    if (fields.length < 14) continue;

    // Filter to Greater London
    const county = fields[13];
    if (county !== "GREATER LONDON") continue;

    // Skip deleted records
    if (fields[15] === "D") continue;

    // Skip if no postcode
    if (!fields[3]) continue;

    londonCount++;
    batch.push(fields);

    if (batch.length >= 5000) {
      flushBatch();
    }

    if (count % 100000 === 0) {
      console.log(`  Processed ${count} rows, ${londonCount} London records...`);
    }
  }

  if (batch.length > 0) flushBatch();

  console.log(`  ${filename}: ${londonCount} London records imported from ${count} total rows.`);
  return londonCount;
}

async function main() {
  const db = getScriptDb();
  initSchema(db);

  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith("pp-") && f.endsWith(".csv"))
    .sort();

  if (files.length === 0) {
    console.error("No CSV files found. Run 01-download-land-registry.ts first.");
    process.exit(1);
  }

  let total = 0;
  for (const file of files) {
    total += await importFile(db, path.join(DATA_DIR, file));
  }

  console.log(`\nTotal: ${total} Greater London records imported.`);

  // Show stats
  const stats = db.prepare("SELECT COUNT(*) as count FROM price_paid").get() as { count: number };
  console.log(`Database now has ${stats.count} price_paid records.`);

  db.close();
}

main().catch(console.error);
