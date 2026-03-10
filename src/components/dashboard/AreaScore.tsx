"use client";

import type { AreaIntelligence } from "@/lib/types";

interface AreaScoreProps {
  data: AreaIntelligence;
}

/**
 * Composite area score summarising all dimensions.
 * Each dimension is scored 1-10 and averaged.
 */
function computeScores(data: AreaIntelligence) {
  const scores: { label: string; score: number; color: string }[] = [];

  // Price affordability (relative to borough)
  if (data.prices && data.prices.boroughMedian) {
    const ratio = data.prices.median / data.prices.boroughMedian;
    // Below borough median is better
    const priceScore = Math.max(1, Math.min(10, Math.round(11 - ratio * 5)));
    scores.push({ label: "Affordability", score: priceScore, color: "#3b82f6" });
  }

  // Safety (inverse of crime count)
  if (data.crime) {
    const monthly = data.crime.total / Math.max(data.crime.trend.length, 1);
    // Rough heuristic: <20 crimes/month = great, >100 = poor
    const safetyScore = Math.max(1, Math.min(10, Math.round(10 - monthly / 12)));
    scores.push({ label: "Safety", score: safetyScore, color: "#ef4444" });
  }

  // Schools (% Outstanding or Good)
  if (data.schools.length > 0) {
    const good = data.schools.filter(
      (s) => s.ofstedRating === "Outstanding" || s.ofstedRating === "Good"
    ).length;
    const schoolScore = Math.max(
      1,
      Math.round((good / data.schools.length) * 10)
    );
    scores.push({ label: "Schools", score: schoolScore, color: "#22c55e" });
  }

  // Transport (based on number of nearby stations)
  if (data.transport.length > 0) {
    const transportScore = Math.min(10, Math.max(1, data.transport.length));
    scores.push({ label: "Transport", score: transportScore, color: "#8b5cf6" });
  }

  // Deprivation
  if (data.demographics) {
    scores.push({
      label: "Deprivation",
      score: data.demographics.imdDecile,
      color: "#f97316",
    });
  }

  return scores;
}

export default function AreaScore({ data }: AreaScoreProps) {
  const scores = computeScores(data);

  if (scores.length === 0) return null;

  const overall = Math.round(
    scores.reduce((sum, s) => sum + s.score, 0) / scores.length
  );

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Area Score
      </h2>

      <div className="flex items-center gap-6 mb-4">
        {/* Overall score circle */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={overall >= 7 ? "#22c55e" : overall >= 4 ? "#eab308" : "#ef4444"}
              strokeWidth="8"
              strokeDasharray={`${(overall / 10) * 264} 264`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <div className="text-2xl font-bold text-gray-900">{overall}</div>
            <div className="text-xs text-gray-500">/10</div>
          </div>
        </div>

        {/* Dimension scores */}
        <div className="flex-1 space-y-2">
          {scores.map(({ label, score, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-24 text-xs text-gray-600">{label}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${score * 10}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <span className="w-6 text-xs font-medium text-gray-700 text-right">
                {score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
