/**
 * Download IMD (Index of Multiple Deprivation) 2019 data.
 * Source: https://www.gov.uk/government/statistics/english-indices-of-deprivation-2019
 *
 * Downloads the official CSV and converts to the format expected by the import script.
 *
 * Run: npx tsx scripts/07-download-demographics.ts
 */
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "data", "demographics");

async function downloadFile(url: string, dest: string): Promise<boolean> {
  console.log(`Downloading ${path.basename(dest)}...`);
  console.log(`  URL: ${url}`);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "HomeScope/0.1" },
      redirect: "follow",
    });
    if (!res.ok) {
      console.error(`  Failed: ${res.status} ${res.statusText}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    console.log(`  Saved (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
    return true;
  } catch (err) {
    console.error(`  Download error:`, err);
    return false;
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const imdPath = path.join(OUTPUT_DIR, "imd-2019.csv");

  if (fs.existsSync(imdPath)) {
    console.log(`IMD file already exists: ${imdPath}`);
    console.log("Next step: npx tsx scripts/08-import-demographics.ts");
    return;
  }

  // Try the direct CSV download from the government's open data site
  // File 7 is the "all domains" CSV version from the official release
  const csvUrls = [
    "https://assets.publishing.service.gov.uk/media/5d8b387a40f0b6188891a6a1/File_7_-_All_IoD2019_Scores__Ranks__Deciles_and_Population_Denominators_3.csv",
    "https://assets.publishing.service.gov.uk/media/5d8b3cfaed915d036a455aba/File_7_-_All_IoD2019_Scores__Ranks__Deciles_and_Population_Denominators_3.csv",
  ];

  let ok = false;
  for (const url of csvUrls) {
    ok = await downloadFile(url, imdPath);
    if (ok) break;
  }

  if (!ok) {
    console.log("\nAutomatic download failed. Please download manually:");
    console.log(
      "  1. Go to https://www.gov.uk/government/statistics/english-indices-of-deprivation-2019"
    );
    console.log(
      '  2. Download "File 7: all IoD2019 scores, ranks, deciles and population denominators"'
    );
    console.log(`  3. Save the CSV as: ${imdPath}`);
    console.log(
      "\n  Alternative: https://opendatacommunities.org/resource?uri=http%3A%2F%2Fopendatacommunities.org%2Fdata%2Fsocietal-wellbeing%2Fimd2019%2Findices"
    );
  } else {
    console.log("\nNext step: npx tsx scripts/08-import-demographics.ts");
  }
}

main().catch(console.error);
