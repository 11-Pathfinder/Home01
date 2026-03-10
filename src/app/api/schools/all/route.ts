import { NextResponse } from "next/server";
import { getAllSchools, getDistinctBoroughs, getDistinctPhases } from "@/lib/queries/schools";

export async function GET() {
  try {
    const schools = getAllSchools();
    const boroughs = getDistinctBoroughs();
    const phases = getDistinctPhases();

    return NextResponse.json({ schools, boroughs, phases });
  } catch (err) {
    console.error("Schools all API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}
