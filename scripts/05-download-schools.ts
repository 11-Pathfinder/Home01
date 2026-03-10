/**
 * Download school data from GIAS (Get Information About Schools).
 * Source: https://get-information-schools.service.gov.uk/Downloads
 *
 * Also downloads Ofsted management information for inspection ratings.
 *
 * Run: npx tsx scripts/05-download-schools.ts
 */
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "data", "schools");

async function downloadFile(url: string, dest: string): Promise<void> {
  console.log(`Downloading ${url}...`);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "HomeScope/0.1 (area-intelligence-tool)",
    },
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

  // GIAS: All establishment data (CSV)
  // This URL provides a CSV extract of all schools in England
  const giasUrl =
    "https://get-information-schools.service.gov.uk/Downloads";
  console.log(`\nNote: GIAS data must be downloaded manually from:`);
  console.log(`  ${giasUrl}`);
  console.log(`  Select "All establishment data" and download the CSV.`);
  console.log(`  Save as: ${path.join(OUTPUT_DIR, "gias-establishments.csv")}`);

  // Ofsted Management Information
  console.log(`\nNote: Ofsted MI data must be downloaded from:`);
  console.log(`  https://www.gov.uk/government/statistical-data-sets/monthly-management-information-ofsteds-school-inspections-outcomes`);
  console.log(`  Download the latest "State-funded schools inspections and outcomes" CSV.`);
  console.log(`  Save as: ${path.join(OUTPUT_DIR, "ofsted-mi.csv")}`);

  console.log(`\nAfter downloading, run: npx tsx scripts/06-import-schools.ts`);
}

main().catch(console.error);
