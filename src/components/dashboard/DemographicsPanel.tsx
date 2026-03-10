"use client";

import type { DemographicsData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface DemographicsPanelProps {
  data: DemographicsData;
}

const DECILE_LABELS: Record<number, string> = {
  1: "Most deprived 10%",
  2: "Most deprived 20%",
  3: "Most deprived 30%",
  4: "Below average",
  5: "Below average",
  6: "Above average",
  7: "Above average",
  8: "Least deprived 30%",
  9: "Least deprived 20%",
  10: "Least deprived 10%",
};

function DeprivationBar({
  label,
  rank,
  maxRank = 32844,
}: {
  label: string;
  rank: number | null;
  maxRank?: number;
}) {
  if (!rank) return null;
  // Higher rank = less deprived. Invert for display (1 = worst, maxRank = best)
  const pct = (rank / maxRank) * 100;
  const color =
    pct < 25
      ? "#ef4444"
      : pct < 50
        ? "#f97316"
        : pct < 75
          ? "#eab308"
          : "#22c55e";

  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-gray-600 mb-0.5">
        <span>{label}</span>
        <span>Rank {formatNumber(rank)}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function DemographicsPanel({ data }: DemographicsPanelProps) {
  const decileLabel = DECILE_LABELS[data.imdDecile] || "";

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Demographics & Deprivation
      </h2>

      <div className="mb-4 rounded-lg bg-gray-50 p-4">
        <div className="text-sm text-gray-600">
          IMD Decile for {data.lsoaName}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">
            {data.imdDecile}
          </span>
          <span className="text-sm text-gray-500">/10</span>
          <span className="text-sm text-gray-600">{decileLabel}</span>
        </div>
        {/* Visual scale */}
        <div className="mt-2 flex gap-0.5">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`h-3 flex-1 rounded-sm ${
                i + 1 <= data.imdDecile
                  ? i < 3
                    ? "bg-red-400"
                    : i < 5
                      ? "bg-orange-400"
                      : i < 8
                        ? "bg-yellow-400"
                        : "bg-green-400"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>Most deprived</span>
          <span>Least deprived</span>
        </div>
      </div>

      {/* Sub-domain ranks */}
      <div className="space-y-1">
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          Deprivation by Domain
        </h3>
        <DeprivationBar label="Income" rank={data.incomeRank} />
        <DeprivationBar label="Employment" rank={data.employmentRank} />
        <DeprivationBar label="Education" rank={data.educationRank} />
        <DeprivationBar label="Health" rank={data.healthRank} />
        <DeprivationBar label="Crime" rank={data.crimeRank} />
        <DeprivationBar label="Housing" rank={data.housingRank} />
        <DeprivationBar label="Environment" rank={data.environmentRank} />
      </div>

      {data.population && (
        <div className="mt-4 flex gap-4 text-sm text-gray-600">
          <span>Population: {formatNumber(data.population)}</span>
          {data.medianAge && <span>Median age: {data.medianAge}</span>}
        </div>
      )}
    </div>
  );
}
