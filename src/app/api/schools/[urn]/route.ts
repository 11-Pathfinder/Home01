import { NextResponse } from "next/server";
import { getSchoolByUrn, getNearbySchools } from "@/lib/queries/schools";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ urn: string }> }
) {
  const { urn: urnStr } = await params;
  const urn = parseInt(urnStr, 10);
  if (isNaN(urn)) {
    return NextResponse.json({ error: "Invalid URN" }, { status: 400 });
  }

  const school = getSchoolByUrn(urn);
  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const nearby = getNearbySchools(urn, 1.5, 10);

  return NextResponse.json({ school, nearby });
}
