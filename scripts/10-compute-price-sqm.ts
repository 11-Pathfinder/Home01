/**
 * Compute price per square metre by joining Land Registry price_paid with EPC data.
 * Matches on postcode + fuzzy address (PAON/house number).
 *
 * Run: npx tsx scripts/10-compute-price-sqm.ts
 */
import { getScriptDb, initSchema } from "./utils/db";

function extractNumber(s: string | null): string | null {
  if (!s) return null;
  const match = s.match(/^(\d+)/);
  return match ? match[1] : null;
}

async function main() {
  const db = getScriptDb();
  initSchema(db);

  // Check if we have EPC data
  const epcCount = db.prepare("SELECT COUNT(*) as count FROM epc").get() as { count: number };
  if (epcCount.count === 0) {
    console.log("No EPC data found. Run scripts 03-04 first, or skip £/sqm for now.");
    db.close();
    return;
  }

  console.log(`Matching ${epcCount.count} EPC records against price_paid data...`);

  // Simple join: match on exact postcode where EPC has floor area
  // This is the basic approach. A more sophisticated version would do
  // fuzzy address matching on PAON/street.
  const insertPsm = db.prepare(`
    INSERT OR IGNORE INTO price_per_sqm
      (price_paid_id, epc_lmk_key, price, floor_area, price_per_sqm, date_of_transfer, postcode, property_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Get postcodes that exist in both tables
  const sharedPostcodes = db
    .prepare(
      `SELECT DISTINCT pp.postcode
       FROM price_paid pp
       INNER JOIN epc e ON pp.postcode = e.postcode
       WHERE e.total_floor_area > 0`
    )
    .all() as { postcode: string }[];

  console.log(`Found ${sharedPostcodes.length} postcodes with both price and EPC data.`);

  let matched = 0;
  const tx = db.transaction(() => {
    for (const { postcode } of sharedPostcodes) {
      // Get all sales for this postcode
      const sales = db
        .prepare(
          `SELECT id, price, date_of_transfer, paon, saon, property_type
           FROM price_paid WHERE postcode = ?`
        )
        .all(postcode) as {
          id: string;
          price: number;
          date_of_transfer: string;
          paon: string;
          saon: string;
          property_type: string;
        }[];

      // Get all EPCs for this postcode
      const epcs = db
        .prepare(
          `SELECT lmk_key, address, total_floor_area, property_type
           FROM epc WHERE postcode = ? AND total_floor_area > 0`
        )
        .all(postcode) as {
          lmk_key: string;
          address: string;
          total_floor_area: number;
          property_type: string;
        }[];

      if (epcs.length === 0) continue;

      for (const sale of sales) {
        const saleNumber = extractNumber(sale.paon);
        if (!saleNumber) {
          // If no house number, just use the first EPC with matching area > 0
          // This is imprecise but better than nothing for aggregated stats
          if (epcs.length === 1) {
            const epc = epcs[0];
            const psm = sale.price / epc.total_floor_area;
            if (psm > 500 && psm < 50000) {
              // Sanity check
              insertPsm.run(
                sale.id, epc.lmk_key, sale.price, epc.total_floor_area,
                Math.round(psm), sale.date_of_transfer, postcode, sale.property_type
              );
              matched++;
            }
          }
          continue;
        }

        // Try to match house number in EPC address
        for (const epc of epcs) {
          const epcNumber = extractNumber(epc.address);
          if (epcNumber === saleNumber) {
            const psm = sale.price / epc.total_floor_area;
            if (psm > 500 && psm < 50000) {
              insertPsm.run(
                sale.id, epc.lmk_key, sale.price, epc.total_floor_area,
                Math.round(psm), sale.date_of_transfer, postcode, sale.property_type
              );
              matched++;
            }
            break; // First match wins
          }
        }
      }
    }
  });

  tx();

  console.log(`\nDone: ${matched} price-per-sqm records computed.`);
  db.close();
}

main().catch(console.error);
