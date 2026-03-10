"use client";

import type { PriceData } from "@/lib/types";
import { formatPrice, formatPricePerSqm, formatNumber } from "@/lib/utils";
import StatCard from "@/components/ui/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  D: "Detached",
  S: "Semi-detached",
  T: "Terraced",
  F: "Flat",
  O: "Other",
};

interface PricePanelProps {
  data: PriceData;
}

export default function PricePanel({ data }: PricePanelProps) {
  const typeData = Object.entries(data.byType)
    .map(([type, info]) => ({
      type: PROPERTY_TYPE_LABELS[type] || type,
      median: info.median,
      count: info.count,
    }))
    .sort((a, b) => b.median - a.median);

  const boroughDiff = data.boroughMedian
    ? Math.round(((data.median - data.boroughMedian) / data.boroughMedian) * 100)
    : null;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Price Intelligence
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <StatCard
          label="Median Price"
          value={formatPrice(data.median)}
          sub={`${formatNumber(data.count)} sales`}
        />
        <StatCard
          label="Mean Price"
          value={formatPrice(data.mean)}
        />
        {data.medianPsm && (
          <StatCard
            label="Median £/sqm"
            value={formatPricePerSqm(data.medianPsm)}
            sub={`${data.psmCount} matched`}
          />
        )}
        {boroughDiff !== null && (
          <StatCard
            label={`vs ${data.borough}`}
            value={`${boroughDiff > 0 ? "+" : ""}${boroughDiff}%`}
            sub={`Borough median: ${formatPrice(data.boroughMedian)}`}
          />
        )}
      </div>

      {/* Price by type */}
      {typeData.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Median Price by Property Type
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => formatPrice(value)}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="median" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Price trend */}
      {data.trend.length > 1 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Price Trend (Quarterly Median)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value: number) => formatPrice(value)} />
              <Line
                type="monotone"
                dataKey="median"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
