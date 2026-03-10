/**
 * Download Land Registry Price Paid Data (last 5 years, yearly files).
 * Source: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
 *
 * Run: npx tsx scripts/01-download-land-registry.ts
 */
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "data", "land-registry");

// Price Paid Data is available as yearly CSV files
// Format: pp-{year}.csv
// Full history file: pp-complete.csv (~4GB) - too large
// We download individual yearly files instead
const CURRENT_YEAR = new Date().getFullYear();
const YEARS_BACK = 5;

async function downloadFile(url: string, dest: string): Promise<void> {
  console.log(`Downloading ${url}...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  console.log(`  Saved to ${dest} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (let year = CURRENT_YEAR - YEARS_BACK; year <= CURRENT_YEAR; year++) {
    const filename = `pp-${year}.csv`;
    const dest = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(dest)) {
      console.log(`${filename} already exists, skipping.`);
      continue;
    }

    const url = `http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-${year}.csv`;
    try {
      await downloadFile(url, dest);
    } catch (err) {
      console.warn(`  Warning: Could not download ${filename}: ${err}`);
    }
  }

  console.log("\nDone. Run 'npx tsx scripts/02-import-land-registry.ts' to import into SQLite.");
}

main().catch(console.error);
