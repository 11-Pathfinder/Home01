/**
 * Batch geocode postcodes using postcodes.io
 * Processes in chunks of 100 (API limit)
 */
export interface PostcodeResult {
  postcode: string;
  lat: number;
  lng: number;
  lsoa_code: string;
  lsoa_name: string;
  ward_code: string;
  ward_name: string;
  district: string;
  outcode: string;
}

export async function batchGeocode(
  postcodes: string[]
): Promise<(PostcodeResult | null)[]> {
  const results: (PostcodeResult | null)[] = [];
  const CHUNK_SIZE = 100;

  for (let i = 0; i < postcodes.length; i += CHUNK_SIZE) {
    const chunk = postcodes.slice(i, i + CHUNK_SIZE);

    const res = await fetch("https://api.postcodes.io/postcodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcodes: chunk }),
    });

    if (!res.ok) {
      results.push(...chunk.map(() => null));
      continue;
    }

    const data = await res.json();

    for (const item of data.result) {
      if (!item.result) {
        results.push(null);
        continue;
      }
      const r = item.result;
      results.push({
        postcode: r.postcode,
        lat: r.latitude,
        lng: r.longitude,
        lsoa_code: r.codes?.lsoa ?? "",
        lsoa_name: r.lsoa ?? "",
        ward_code: r.codes?.ward ?? "",
        ward_name: r.ward ?? "",
        district: r.admin_district ?? "",
        outcode: r.outcode ?? "",
      });
    }

    // Rate limit: pause 200ms between chunks
    if (i + CHUNK_SIZE < postcodes.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if ((i / CHUNK_SIZE) % 10 === 0 && i > 0) {
      console.log(`  Geocoded ${i}/${postcodes.length} postcodes...`);
    }
  }

  return results;
}
