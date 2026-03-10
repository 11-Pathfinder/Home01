import type { PostcodeInfo } from "./types";
import { getDb } from "./db";
import { normalizePostcode } from "./utils";

const BASE_URL = "https://api.postcodes.io";

/**
 * Look up a single postcode via postcodes.io, with local DB fallback.
 */
export async function lookupPostcode(postcode: string): Promise<PostcodeInfo | null> {
  // Try the external API first
  try {
    const encoded = encodeURIComponent(postcode.replace(/\s+/g, ""));
    const res = await fetch(`${BASE_URL}/postcodes/${encoded}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 200 && data.result) {
        const r = data.result;
        return {
          postcode: r.postcode,
          lat: r.latitude,
          lng: r.longitude,
          lsoa_code: r.codes?.lsoa ?? "",
          lsoa_name: r.lsoa ?? "",
          ward_code: r.codes?.ward ?? "",
          ward_name: r.ward ?? "",
          district: r.admin_district ?? "",
          outcode: r.outcode ?? "",
        };
      }
    }
  } catch {
    // External API unreachable — fall through to local DB
  }

  // Fallback: look up from local postcodes table
  return lookupPostcodeLocal(postcode);
}

/**
 * Look up a postcode from the local SQLite database.
 */
function lookupPostcodeLocal(postcode: string): PostcodeInfo | null {
  try {
    const db = getDb();
    const normalized = normalizePostcode(postcode);

    // Exact match first
    let row = db
      .prepare(
        `SELECT postcode, lat, lng, lsoa_code, lsoa_name, ward_name, district, outcode
         FROM postcodes WHERE postcode = ?`
      )
      .get(normalized) as PostcodeInfo | undefined;

    if (!row) {
      // Try without spaces
      const compact = postcode.replace(/\s+/g, "").toUpperCase();
      row = db
        .prepare(
          `SELECT postcode, lat, lng, lsoa_code, lsoa_name, ward_name, district, outcode
           FROM postcodes WHERE REPLACE(postcode, ' ', '') = ?`
        )
        .get(compact) as PostcodeInfo | undefined;
    }

    if (!row) {
      // Try sector match — find the closest postcode in the same sector
      const sector = normalized.slice(0, -2).trim();
      row = db
        .prepare(
          `SELECT postcode, lat, lng, lsoa_code, lsoa_name, ward_name, district, outcode
           FROM postcodes WHERE postcode LIKE ? || '%' LIMIT 1`
        )
        .get(sector) as PostcodeInfo | undefined;
    }

    if (row) {
      return {
        postcode: normalized,
        lat: row.lat,
        lng: row.lng,
        lsoa_code: row.lsoa_code ?? "",
        lsoa_name: row.lsoa_name ?? "",
        ward_code: "",
        ward_name: row.ward_name ?? "",
        district: row.district ?? "",
        outcode: row.outcode ?? "",
      };
    }
  } catch {
    // DB not available
  }

  return null;
}

/**
 * Batch lookup postcodes (max 100 per request)
 */
export async function batchLookupPostcodes(
  postcodes: string[]
): Promise<(PostcodeInfo | null)[]> {
  try {
    const res = await fetch(`${BASE_URL}/postcodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcodes }),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      return data.result.map(
        (item: { result: Record<string, unknown> | null }) => {
          if (!item.result) return null;
          const r = item.result as Record<string, unknown>;
          const codes = r.codes as Record<string, string> | undefined;
          return {
            postcode: r.postcode as string,
            lat: r.latitude as number,
            lng: r.longitude as number,
            lsoa_code: codes?.lsoa ?? "",
            lsoa_name: (r.lsoa as string) ?? "",
            ward_code: codes?.ward ?? "",
            ward_name: (r.ward as string) ?? "",
            district: (r.admin_district as string) ?? "",
            outcode: (r.outcode as string) ?? "",
          };
        }
      );
    }
  } catch {
    // Fall through to local lookup
  }

  // Fallback: look up each postcode locally
  return postcodes.map((pc) => lookupPostcodeLocal(pc));
}

/**
 * Autocomplete postcode search
 */
export async function autocompletePostcode(
  partial: string
): Promise<string[]> {
  // Try external API
  try {
    const encoded = encodeURIComponent(partial.replace(/\s+/g, ""));
    const res = await fetch(`${BASE_URL}/postcodes/${encoded}/autocomplete`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.result?.length > 0) return data.result;
    }
  } catch {
    // Fall through to local
  }

  // Fallback: query local DB
  try {
    const db = getDb();
    const prefix = partial.replace(/\s+/g, "").toUpperCase();
    const rows = db
      .prepare(
        `SELECT DISTINCT postcode FROM postcodes
         WHERE REPLACE(postcode, ' ', '') LIKE ? || '%'
         ORDER BY postcode LIMIT 10`
      )
      .all(prefix) as { postcode: string }[];
    return rows.map((r) => r.postcode);
  } catch {
    return [];
  }
}
