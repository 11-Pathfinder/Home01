/**
 * Format a number as GBP currency (e.g. £450,000)
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format £/sqm (e.g. £6,250/sqm)
 */
export function formatPricePerSqm(value: number): string {
  return `${formatPrice(value)}/sqm`;
}

/**
 * Format a number with commas (e.g. 1,234)
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

/**
 * Calculate the Haversine distance between two lat/lng points in km.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Normalize a UK postcode to uppercase with proper spacing.
 * e.g. "sw1a1aa" -> "SW1A 1AA"
 */
export function normalizePostcode(postcode: string): string {
  const clean = postcode.replace(/\s+/g, "").toUpperCase();
  if (clean.length < 5 || clean.length > 7) return clean;
  const outcode = clean.slice(0, -3);
  const incode = clean.slice(-3);
  return `${outcode} ${incode}`;
}

/**
 * Get the outcode (first part) of a postcode. e.g. "SW1A 1AA" -> "SW1A"
 */
export function getOutcode(postcode: string): string {
  const normalized = normalizePostcode(postcode);
  return normalized.split(" ")[0];
}

/**
 * Get the postcode sector. e.g. "SW1A 1AA" -> "SW1A 1"
 */
export function getPostcodeSector(postcode: string): string {
  const normalized = normalizePostcode(postcode);
  return normalized.slice(0, -2).trim();
}

/**
 * Ofsted rating colour mapping
 */
export function ofstedColor(rating: string | null): string {
  switch (rating) {
    case "Outstanding":
      return "#16a34a"; // green-600
    case "Good":
      return "#65a30d"; // lime-600
    case "Requires improvement":
      return "#f59e0b"; // amber-500
    case "Inadequate":
      return "#dc2626"; // red-600
    default:
      return "#9ca3af"; // gray-400
  }
}
