/**
 * Download IMD (Index of Multiple Deprivation) 2019 data.
 * Source: https://opendatacommunities.org/
 *
 * Run: npx tsx scripts/07-download-demographics.ts
 */
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "data", "demographics");

async function downloadFile(url: string, dest: string): Promise<void> {
  console.log(`Downloading ${path.basename(dest)}...`);
  const res = await fetch(url, {
    headers: { "User-Agent": "HomeScope/0.1" },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Failed: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  console.log(`  Saved (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // IMD 2019 — File 1: Index of Multiple Deprivation
  // This is the main IMD rankings for all LSOAs in England
  const imdUrl =
    "https://assets.publishing.service.gov.uk/media/5d8b3b40ed915d036a455aa6/File_1_-_IMD2019_Index_of_Multiple_Deprivation.xlsx";

  console.log("\nNote: IMD data is in XLSX format. For simplicity, download the CSV version:");
  console.log("  https://opendatacommunities.org/resource?uri=http%3A%2F%2Fopendatacommunities.org%2Fdata%2Fsocietal-wellbeing%2Fimd2019%2Findices");
  console.log(`  Save as: ${path.join(OUTPUT_DIR, "imd-2019.csv")}`);
  console.log("\nAlternatively, the XLSX file can be downloaded from:");
  console.log(`  ${imdUrl}`);

  console.log(`\nAfter downloading, run: npx tsx scripts/08-import-demographics.ts`);
}

main().catch(console.error);
