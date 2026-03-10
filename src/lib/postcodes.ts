import type { PostcodeInfo } from "./types";

const BASE_URL = "https://api.postcodes.io";

/**
 * Look up a single postcode via postcodes.io
 */
export async function lookupPostcode(postcode: string): Promise<PostcodeInfo | null> {
  const encoded = encodeURIComponent(postcode.replace(/\s+/g, ""));
  const res = await fetch(`${BASE_URL}/postcodes/${encoded}`);
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== 200 || !data.result) return null;

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

/**
 * Batch lookup postcodes (max 100 per request)
 */
export async function batchLookupPostcodes(
  postcodes: string[]
): Promise<(PostcodeInfo | null)[]> {
  const res = await fetch(`${BASE_URL}/postcodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postcodes }),
  });

  if (!res.ok) return postcodes.map(() => null);

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

/**
 * Autocomplete postcode search
 */
export async function autocompletePostcode(
  partial: string
): Promise<string[]> {
  const encoded = encodeURIComponent(partial.replace(/\s+/g, ""));
  const res = await fetch(`${BASE_URL}/postcodes/${encoded}/autocomplete`);
  if (!res.ok) return [];

  const data = await res.json();
  return data.result ?? [];
}
