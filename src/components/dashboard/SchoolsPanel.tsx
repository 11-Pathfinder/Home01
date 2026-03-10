"use client";

import { useState } from "react";
import type { School } from "@/lib/types";
import { ofstedColor } from "@/lib/utils";

interface SchoolsPanelProps {
  schools: School[];
}

export default function SchoolsPanel({ schools }: SchoolsPanelProps) {
  const [phaseFilter, setPhaseFilter] = useState<string>("all");

  const filtered =
    phaseFilter === "all"
      ? schools
      : schools.filter((s) =>
          s.phase.toLowerCase().includes(phaseFilter.toLowerCase())
        );

  const phases = [
    "all",
    ...new Set(schools.map((s) => s.phase).filter(Boolean)),
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Nearby Schools ({schools.length})
        </h2>
        <div className="flex gap-1">
          {phases.map((phase) => (
            <button
              key={phase}
              onClick={() => setPhaseFilter(phase)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                phaseFilter === phase
                  ? "bg-primary-100 text-primary-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {phase === "all" ? "All" : phase}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No schools found in this area.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filtered.map((school) => (
            <div
              key={school.urn}
              className="flex items-start gap-3 rounded-lg border border-gray-50 p-3 hover:bg-gray-50"
            >
              {/* Ofsted badge */}
              <div
                className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: ofstedColor(school.ofstedRating) }}
                title={school.ofstedRating || "Not rated"}
              >
                {school.ofstedRating
                  ? school.ofstedRating.charAt(0)
                  : "?"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">
                    {school.name}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-500">
                  <span>{school.phase}</span>
                  {school.ofstedRating && (
                    <span
                      style={{ color: ofstedColor(school.ofstedRating) }}
                      className="font-medium"
                    >
                      {school.ofstedRating}
                    </span>
                  )}
                  {school.numberOfPupils && (
                    <span>{school.numberOfPupils} pupils</span>
                  )}
                  {school.distance != null && (
                    <span>{school.distance.toFixed(1)}km away</span>
                  )}
                </div>
              </div>

              {school.website && (
                <a
                  href={
                    school.website.startsWith("http")
                      ? school.website
                      : `https://${school.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-xs text-primary-600 hover:underline"
                >
                  Website
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
