// ============================================================
// Shared TypeScript types for HomeScope
// ============================================================

// --- Geocoding ---
export interface PostcodeInfo {
  postcode: string;
  lat: number;
  lng: number;
  lsoa_code: string;
  lsoa_name: string;
  ward_code: string;
  ward_name: string;
  district: string; // Borough
  outcode: string;
}

// --- Prices ---
export interface PriceData {
  median: number;
  mean: number;
  min: number;
  max: number;
  count: number;
  medianPsm: number | null; // £ per sqm (null if insufficient EPC data)
  psmCount: number; // number of matched records used for psm
  byType: Record<string, { median: number; count: number }>;
  trend: PriceTrendPoint[];
  borough: string;
  boroughMedian: number;
}

export interface PriceTrendPoint {
  period: string; // "2024-Q1"
  median: number;
  count: number;
}

// --- Crime ---
export interface CrimeData {
  total: number;
  byCategory: Record<string, number>;
  trend: CrimeTrendPoint[];
  londonAverage: number | null;
}

export interface CrimeTrendPoint {
  month: string; // "2024-01"
  count: number;
}

// --- Schools ---
export interface School {
  urn: number;
  name: string;
  phase: string;
  type: string;
  postcode: string;
  lat: number;
  lng: number;
  ofstedRating: string | null;
  lastInspectionDate: string | null;
  numberOfPupils: number | null;
  gender: string | null;
  religiousCharacter: string | null;
  website: string | null;
  distance?: number; // km from search point (absent in directory view)
}

// --- Transport ---
export interface Station {
  name: string;
  mode: string; // "tube" | "rail" | "dlr" | "overground" | "elizabeth-line"
  lines: string[];
  lat: number;
  lng: number;
  distance: number; // metres
}

// --- Demographics ---
export interface DemographicsData {
  lsoaCode: string;
  lsoaName: string;
  imdDecile: number; // 1 = most deprived, 10 = least
  imdRank: number;
  incomeRank: number;
  employmentRank: number;
  educationRank: number;
  healthRank: number;
  crimeRank: number;
  housingRank: number;
  environmentRank: number;
  population: number | null;
  medianAge: number | null;
}

// --- Aggregated Area Intelligence ---
export interface AreaIntelligence {
  postcode: PostcodeInfo;
  prices: PriceData | null;
  crime: CrimeData | null;
  schools: School[];
  transport: Station[];
  demographics: DemographicsData | null;
}
