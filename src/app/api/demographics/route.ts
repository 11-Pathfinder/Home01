import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { DemographicsData } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lsoa = searchParams.get("lsoa");

  if (!lsoa) {
    return NextResponse.json(
      { error: "Missing lsoa parameter" },
      { status: 400 }
    );
  }

  try {
    const db = getDb();

    const row = db
      .prepare("SELECT * FROM lsoa_demographics WHERE lsoa_code = ?")
      .get(lsoa) as {
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

    if (!row) {
      return NextResponse.json(
        { error: "LSOA not found" },
        { status: 404 }
      );
    }

    const result: DemographicsData = {
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

    return NextResponse.json(result);
  } catch (err) {
    console.error("Demographics API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch demographics" },
      { status: 500 }
    );
  }
}
