/**
 * Download EPC (Energy Performance Certificate) bulk data for London boroughs.
 * Source: https://epc.opendatacommunities.org/
 *
 * The EPC API requires registration for an API key. Set EPC_API_KEY in .env.local.
 * If no API key is available, this script provides instructions for manual download.
 *
 * Run: npx tsx scripts/03-download-epc.ts
 */
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "data", "epc");

// All 33 London local authorities (borough codes used by EPC API)
const LONDON_AUTHORITIES = [
  "E09000001", // City of London
  "E09000002", // Barking and Dagenham
  "E09000003", // Barnet
  "E09000004", // Bexley
  "E09000005", // Brent
  "E09000006", // Bromley
  "E09000007", // Camden
  "E09000008", // Croydon
  "E09000009", // Ealing
  "E09000010", // Enfield
  "E09000011", // Greenwich
  "E09000012", // Hackney
  "E09000013", // Hammersmith and Fulham
  "E09000014", // Haringey
  "E09000015", // Harrow
  "E09000016", // Havering
  "E09000017", // Hillingdon
  "E09000018", // Hounslow
  "E09000019", // Islington
  "E09000020", // Kensington and Chelsea
  "E09000021", // Kingston upon Thames
  "E09000022", // Lambeth
  "E09000023", // Lewisham
  "E09000024", // Merton
  "E09000025", // Newham
  "E09000026", // Redbridge
  "E09000027", // Richmond upon Thames
  "E09000028", // Southwark
  "E09000029", // Sutton
  "E09000030", // Tower Hamlets
  "E09000031", // Waltham Forest
  "E09000032", // Wandsworth
  "E09000033", // Westminster
];

const EPC_API_KEY = process.env.EPC_API_KEY || "";

async function downloadBoroughEpc(authorityCode: string): Promise<void> {
  const dest = path.join(OUTPUT_DIR, `${authorityCode}.csv`);
  if (fs.existsSync(dest)) {
    console.log(`  ${authorityCode}.csv already exists, skipping.`);
    return;
  }

  // The EPC API supports bulk download by local authority
  // GET https://epc.opendatacommunities.org/api/v1/domestic/search
  //   ?local-authority=E09000001&size=5000
  // Returns CSV with header row
  const allRows: string[] = [];
  let from = 0;
  const pageSize = 5000;
  let header = "";

  while (true) {
    const url = `https://epc.opendatacommunities.org/api/v1/domestic/search?local-authority=${authorityCode}&size=${pageSize}&from=${from}`;
    const res = await fetch(url, {
      headers: {
        Accept: "text/csv",
        Authorization: `Basic ${Buffer.from(`${EPC_API_KEY}:`).toString("base64")}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        console.error(
          `  Auth failed for ${authorityCode}. Set EPC_API_KEY in .env.local.`
        );
        return;
      }
      console.warn(`  HTTP ${res.status} for ${authorityCode}, skipping.`);
      return;
    }

    const text = await res.text();
    const lines = text.split("\n").filter((l) => l.trim());

    if (lines.length === 0) break;

    // First page captures the header
    if (from === 0 && lines.length > 0) {
      header = lines[0];
      allRows.push(...lines.slice(1));
    } else {
      // Subsequent pages skip the header row
      allRows.push(...lines.slice(1));
    }

    console.log(
      `  ${authorityCode}: fetched ${allRows.length} records (page from=${from})...`
    );

    // If we got fewer results than page size, we're done
    if (lines.length - 1 < pageSize) break;
    from += pageSize;
  }

  if (allRows.length > 0) {
    fs.writeFileSync(dest, header + "\n" + allRows.join("\n") + "\n");
    console.log(
      `  Saved ${authorityCode}.csv (${allRows.length} records)`
    );
  } else {
    console.log(`  No records for ${authorityCode}.`);
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  if (!EPC_API_KEY) {
    console.log("=== EPC Data Download ===");
    console.log("");
    console.log("No EPC_API_KEY found in environment.");
    console.log("To download EPC data automatically:");
    console.log("  1. Register at https://epc.opendatacommunities.org/login");
    console.log("  2. Get your API key from the dashboard");
    console.log("  3. Add EPC_API_KEY=your_key to .env.local");
    console.log("  4. Re-run this script");
    console.log("");
    console.log("Alternatively, download bulk data manually:");
    console.log(
      "  1. Go to https://epc.opendatacommunities.org/domestic/search"
    );
    console.log("  2. Filter by each London borough");
    console.log("  3. Export as CSV");
    console.log(`  4. Save files to ${OUTPUT_DIR}/`);
    console.log("");
    console.log("Skipping EPC download. The app will work without £/sqm data.");
    return;
  }

  console.log(
    `Downloading EPC data for ${LONDON_AUTHORITIES.length} London boroughs...`
  );

  for (const code of LONDON_AUTHORITIES) {
    try {
      await downloadBoroughEpc(code);
    } catch (err) {
      console.warn(`  Error downloading ${code}: ${err}`);
    }
  }

  console.log(
    "\nDone. Run 'npx tsx scripts/04-import-epc.ts' to import into SQLite."
  );
}

main().catch(console.error);
