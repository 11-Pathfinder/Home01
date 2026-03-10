"use client";

import type { CrimeData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import StatCard from "@/components/ui/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#14b8a6",
];

interface CrimePanelProps {
  data: CrimeData;
}

export default function CrimePanel({ data }: CrimePanelProps) {
  // Sort categories by count
  const categoryData = Object.entries(data.byCategory)
    .map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  const topCategories = categoryData.slice(0, 8);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Crime & Safety
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          label="Total Crimes"
          value={formatNumber(data.total)}
          sub="Last 3 months nearby"
        />
        <StatCard
          label="Monthly Average"
          value={formatNumber(Math.round(data.total / Math.max(data.trend.length, 1)))}
          sub="Crimes per month"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Crime breakdown pie chart */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            By Category
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={topCategories}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name.slice(0, 12)} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {topCategories.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trend */}
        {data.trend.length > 1 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Monthly Trend
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category table */}
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          Crime Breakdown
        </h3>
        <div className="max-h-48 overflow-y-auto">
          <table className="w-full text-sm">
            <tbody>
              {categoryData.map(({ name, value }) => (
                <tr key={name} className="border-b border-gray-50">
                  <td className="py-1.5 text-gray-700">{name}</td>
                  <td className="py-1.5 text-right font-medium text-gray-900">
                    {formatNumber(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
