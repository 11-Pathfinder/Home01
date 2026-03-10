import { NextRequest, NextResponse } from "next/server";
import { lookupPostcode, autocompletePostcode } from "@/lib/postcodes";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Autocomplete mode
  const autocomplete = searchParams.get("autocomplete");
  if (autocomplete) {
    const suggestions = await autocompletePostcode(autocomplete);
    return NextResponse.json({ suggestions });
  }

  // Lookup mode
  const postcode = searchParams.get("q");
  if (!postcode) {
    return NextResponse.json(
      { error: "Missing 'q' or 'autocomplete' parameter" },
      { status: 400 }
    );
  }

  const result = await lookupPostcode(postcode);
  if (!result) {
    return NextResponse.json(
      { error: "Postcode not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
