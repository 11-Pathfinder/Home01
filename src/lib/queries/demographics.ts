import { getDb } from "@/lib/db";
import type { DemographicsData } from "@/lib/types";

/**
 * Look up demographics data by LSOA code.
 * Returns null if not found.
 */
export function getDemographics(lsoaCode: string): DemographicsData | null {
  const db = getDb();

  const row = db
    .prepare("SELECT * FROM lsoa_demographics WHERE lsoa_code = ?")
    .get(lsoaCode) as {
      lsoa_code: string;
      lsoa_name: string;
      imd_rank: number;
      imd_decile: number;
      income_rank: number;
      employment_rank: number;
      education_rank: number;
      health_rank: number;
      crime_rank: number;
      housing_rank: number;
      environment_rank: number;
      population: number;
      median_age: number;
    } | undefined;

  if (!row) return null;

  return {
    lsoaCode: row.lsoa_code,
    lsoaName: row.lsoa_name,
    imdDecile: row.imd_decile,
    imdRank: row.imd_rank,
    incomeRank: row.income_rank,
    employmentRank: row.employment_rank,
    educationRank: row.education_rank,
    healthRank: row.health_rank,
    crimeRank: row.crime_rank,
    housingRank: row.housing_rank,
    environmentRank: row.environment_rank,
    population: row.population,
    medianAge: row.median_age,
  };
}
