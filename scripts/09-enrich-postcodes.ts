/**
 * Enrich postcodes table by batch-looking up all unique postcodes
 * from the price_paid table via postcodes.io.
 *
 * Run: npx tsx scripts/09-enrich-postcodes.ts
 */
import { getScriptDb, initSchema } from "./utils/db";
import { batchGeocode } from "./utils/geocode";

async function main() {
  const db = getScriptDb();
  initSchema(db);

  // Get all unique postcodes from price_paid that aren't already in postcodes table
  const rows = db
    .prepare(
      `SELECT DISTINCT postcode FROM price_paid
       WHERE postcode NOT IN (SELECT postcode FROM postcodes)
       AND postcode IS NOT NULL AND postcode != ''`
    )
    .all() as { postcode: string }[];

  console.log(`Found ${rows.length} new postcodes to geocode.`);

  if (rows.length === 0) {
    console.log("Nothing to do.");
    db.close();
    return;
  }

  const postcodes = rows.map((r) => r.postcode);
  const results = await batchGeocode(postcodes);

  const insertPostcode = db.prepare(`
    INSERT OR IGNORE INTO postcodes (postcode, lat, lng, lsoa_code, lsoa_name, ward_code, ward_name, district, outcode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRtree = db.prepare(`
    INSERT INTO postcodes_rtree (id, min_lat, max_lat, min_lng, max_lng)
    VALUES (?, ?, ?, ?, ?)
  `);

  let success = 0;
  let failed = 0;

  const tx = db.transaction(() => {
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (!result) {
        failed++;
        continue;
      }

      insertPostcode.run(
        result.postcode,
        result.lat,
        result.lng,
        result.lsoa_code,
        result.lsoa_name,
        result.ward_code,
        result.ward_name,
        result.district,
        result.outcode
      );

      // R-Tree uses rowid, use a simple incrementing ID
      insertRtree.run(
        success + 1,
        result.lat,
        result.lat,
        result.lng,
        result.lng
      );

      success++;
    }
  });

  tx();

  console.log(`\nDone: ${success} postcodes geocoded, ${failed} failed.`);

  const stats = db.prepare("SELECT COUNT(*) as count FROM postcodes").get() as { count: number };
  console.log(`Database now has ${stats.count} postcodes.`);

  db.close();
}

main().catch(console.error);
