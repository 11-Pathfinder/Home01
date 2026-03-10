import { NextRequest, NextResponse } from "next/server";
import { getPrices } from "@/lib/queries/prices";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");
  const years = parseInt(searchParams.get("years") || "5", 10);

  if (!postcode) {
    return NextResponse.json({ error: "Missing postcode" }, { status: 400 });
  }

  try {
    const result = getPrices(postcode, years);
    if (!result) {
      return NextResponse.json({ error: "No data for this area" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("Price API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch price data" },
      { status: 500 }
    );
  }
}
