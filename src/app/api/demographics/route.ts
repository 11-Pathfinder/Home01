import { NextRequest, NextResponse } from "next/server";
import { getDemographics } from "@/lib/queries/demographics";

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
    const result = getDemographics(lsoa);
    if (!result) {
      return NextResponse.json({ error: "LSOA not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("Demographics API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch demographics" },
      { status: 500 }
    );
  }
}
