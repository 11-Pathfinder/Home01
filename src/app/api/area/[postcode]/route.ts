import { NextRequest, NextResponse } from "next/server";
import { lookupPostcode } from "@/lib/postcodes";
import type { AreaIntelligence } from "@/lib/types";

/**
 * Aggregated area intelligence endpoint.
 * Fetches all data sources in parallel for a given postcode.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postcode: string }> }
) {
  const { postcode } = await params;
  const decoded = decodeURIComponent(postcode);

  // 1. Geocode the postcode
  const postcodeInfo = await lookupPostcode(decoded);
  if (!postcodeInfo) {
    return NextResponse.json(
      { error: "Postcode not found" },
      { status: 404 }
    );
  }

  const { lat, lng, lsoa_code } = postcodeInfo;
  const origin = new URL(request.url).origin;

  // 2. Fetch all data sources in parallel
  const [pricesRes, crimeRes, schoolsRes, transportRes, demographicsRes] =
    await Promise.allSettled([
      fetch(`${origin}/api/prices?postcode=${encodeURIComponent(decoded)}`).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${origin}/api/crime?lat=${lat}&lng=${lng}`).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${origin}/api/schools?lat=${lat}&lng=${lng}&radius=3`).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${origin}/api/transport?lat=${lat}&lng=${lng}`).then((r) =>
        r.ok ? r.json() : null
      ),
      lsoa_code
        ? fetch(`${origin}/api/demographics?lsoa=${encodeURIComponent(lsoa_code)}`).then(
            (r) => (r.ok ? r.json() : null)
          )
        : Promise.resolve(null),
    ]);

  const schoolsData = schoolsRes.status === "fulfilled" ? schoolsRes.value : null;
  console.log(`[area API] schools raw:`, JSON.stringify(schoolsData)?.slice(0, 500));

  const result: AreaIntelligence = {
    postcode: postcodeInfo,
    prices: pricesRes.status === "fulfilled" ? pricesRes.value : null,
    crime: crimeRes.status === "fulfilled" ? crimeRes.value : null,
    schools: schoolsData?.schools ?? [],
    transport:
      transportRes.status === "fulfilled"
        ? transportRes.value?.stations ?? []
        : [],
    demographics:
      demographicsRes.status === "fulfilled" ? demographicsRes.value : null,
  };

  return NextResponse.json(result);
}
