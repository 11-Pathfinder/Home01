import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { PriceData, PriceTrendPoint } from "@/lib/types";
import { getOutcode, getPostcodeSector } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");
  const years = parseInt(searchParams.get("years") || "5", 10);

  if (!postcode) {
    return NextResponse.json({ error: "Missing postcode" }, { status: 400 });
  }

  try {
    const db = getDb();
    const sector = getPostcodeSector(postcode);
    const outcode = getOutcode(postcode);

    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - years);
    const cutoff = cutoffDate.toISOString().split("T")[0];

    // Get all sales in the postcode sector
    const sales = db
      .prepare(
        `SELECT price, date_of_transfer, property_type
         FROM price_paid
         WHERE postcode LIKE ? || '%'
         AND date_of_transfer >= ?
         ORDER BY date_of_transfer DESC`
      )
      .all(sector, cutoff) as {
        price: number;
        date_of_transfer: string;
        property_type: string;
      }[];

    if (sales.length === 0) {
      return NextResponse.json({ error: "No data for this area" }, { status: 404 });
    }

    // Compute stats
    const prices = sales.map((s) => s.price).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];
    const mean = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    // By property type
    const byType: Record<string, { median: number; count: number }> = {};
    const typeGroups: Record<string, number[]> = {};
    for (const sale of sales) {
      const t = sale.property_type || "O";
      if (!typeGroups[t]) typeGroups[t] = [];
      typeGroups[t].push(sale.price);
    }
    for (const [type, typePrices] of Object.entries(typeGroups)) {
      typePrices.sort((a, b) => a - b);
      byType[type] = {
        median: typePrices[Math.floor(typePrices.length / 2)],
        count: typePrices.length,
      };
    }

    // Price trend by quarter
    const quarterGroups: Record<string, number[]> = {};
    for (const sale of sales) {
      const date = new Date(sale.date_of_transfer);
      const q = Math.ceil((date.getMonth() + 1) / 3);
      const key = `${date.getFullYear()}-Q${q}`;
      if (!quarterGroups[key]) quarterGroups[key] = [];
      quarterGroups[key].push(sale.price);
    }

    const trend: PriceTrendPoint[] = Object.entries(quarterGroups)
      .map(([period, qPrices]) => {
        qPrices.sort((a, b) => a - b);
        return {
          period,
          median: qPrices[Math.floor(qPrices.length / 2)],
          count: qPrices.length,
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));

    // £/sqm from price_per_sqm table
    const psmRows = db
      .prepare(
        `SELECT price_per_sqm FROM price_per_sqm
         WHERE postcode LIKE ? || '%'
         AND date_of_transfer >= ?`
      )
      .all(sector, cutoff) as { price_per_sqm: number }[];

    const psmValues = psmRows.map((r) => r.price_per_sqm).sort((a, b) => a - b);
    const medianPsm =
      psmValues.length > 0
        ? psmValues[Math.floor(psmValues.length / 2)]
        : null;

    // Borough median for comparison
    const district = db
      .prepare("SELECT district FROM postcodes WHERE outcode = ? LIMIT 1")
      .get(outcode) as { district: string } | undefined;

    let boroughMedian = 0;
    const borough = district?.district || "";
    if (borough) {
      const boroughRow = db
        .prepare(
          `SELECT price FROM price_paid
           WHERE district = ? AND date_of_transfer >= ?
           ORDER BY price`
        )
        .all(borough, cutoff) as { price: number }[];
      if (boroughRow.length > 0) {
        boroughMedian = boroughRow[Math.floor(boroughRow.length / 2)].price;
      }
    }

    const result: PriceData = {
      median,
      mean,
      min: prices[0],
      max: prices[prices.length - 1],
      count: sales.length,
      medianPsm,
      psmCount: psmValues.length,
      byType,
      trend,
      borough,
      boroughMedian,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Price API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch price data" },
      { status: 500 }
    );
  }
}
