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

async function downloadFile(url: string, dest: string): Promise<boolean> {
  console.log(`Downloading ${path.basename(dest)}...`);
  console.log(`  URL: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "HomeScope/0.1 (area-intelligence-tool)",
      },
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

  const giasPath = path.join(OUTPUT_DIR, "gias-establishments.csv");
  const ofstedPath = path.join(OUTPUT_DIR, "ofsted-mi.csv");

  // GIAS: Direct CSV download of all establishment data
  // This is the publicly accessible bulk extract endpoint
  const giasUrl =
    "https://ea-edubase-api-prod.azurewebsites.net/edubase/downloads/public/edubasealldata20260310.csv";
  const giasFallbackUrl =
    "https://ea-edubase-api-prod.azurewebsites.net/edubase/downloads/public/allestablishments.csv";

  let giasOk = false;
  if (!fs.existsSync(giasPath)) {
    giasOk = await downloadFile(giasUrl, giasPath);
    if (!giasOk) {
      console.log("  Trying fallback URL...");
      giasOk = await downloadFile(giasFallbackUrl, giasPath);
    }
    if (!giasOk) {
      console.log("\nAutomatic download failed. Please download manually:");
      console.log("  1. Go to https://get-information-schools.service.gov.uk/Downloads");
      console.log('  2. Select "All establishment data" and download the CSV');
      console.log(`  3. Save as: ${giasPath}`);
    }
  } else {
    console.log(`GIAS file already exists: ${giasPath}`);
    giasOk = true;
  }

  // Ofsted MI is optional — inspection ratings enrich the data but aren't required
  if (!fs.existsSync(ofstedPath)) {
    console.log(
      "\nOfsted MI data (optional) must be downloaded manually from:"
    );
    console.log(
      "  https://www.gov.uk/government/statistical-data-sets/monthly-management-information-ofsteds-school-inspections-outcomes"
    );
    console.log(
      '  Download the latest "State-funded schools inspections and outcomes" CSV.'
    );
    console.log(`  Save as: ${ofstedPath}`);
    console.log("  (Skipping Ofsted will still import schools without ratings.)");
  }

  if (giasOk) {
    console.log("\nNext step: npx tsx scripts/06-import-schools.ts");
  }
}

main().catch(console.error);
