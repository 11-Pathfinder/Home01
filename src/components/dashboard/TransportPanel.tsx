"use client";

import type { Station } from "@/lib/types";

const MODE_COLORS: Record<string, string> = {
  tube: "#0019a8",
  dlr: "#00b0b0",
  overground: "#ef7b10",
  "elizabeth-line": "#6950a1",
  rail: "#e21836",
};

const MODE_LABELS: Record<string, string> = {
  tube: "Tube",
  dlr: "DLR",
  overground: "Overground",
  "elizabeth-line": "Elizabeth Line",
  rail: "National Rail",
};

interface TransportPanelProps {
  stations: Station[];
}

export default function TransportPanel({ stations }: TransportPanelProps) {
  if (stations.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Transport</h2>
        <p className="text-sm text-gray-500">No stations found nearby.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Nearby Stations ({stations.length})
      </h2>

      <div className="space-y-2">
        {stations.map((station, idx) => (
          <div
            key={`${station.name}-${idx}`}
            className="flex items-center gap-3 rounded-lg border border-gray-50 p-3 hover:bg-gray-50"
          >
            {/* Mode icon */}
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{
                backgroundColor: MODE_COLORS[station.mode] || "#666",
              }}
            >
              {station.mode === "tube"
                ? "T"
                : station.mode === "dlr"
                  ? "D"
                  : station.mode === "elizabeth-line"
                    ? "E"
                    : "R"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">{station.name}</div>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {station.lines.slice(0, 5).map((line) => (
                  <span
                    key={line}
                    className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                  >
                    {line}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <div className="text-sm font-medium text-gray-900">
                {station.distance}m
              </div>
              <div className="text-xs text-gray-500">
                {MODE_LABELS[station.mode] || station.mode}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
