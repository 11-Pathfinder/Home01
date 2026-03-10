"use client";

export interface FilterState {
  phase: string;
  ofstedRating: string;
  district: string;
  search: string;
}

interface SchoolFiltersProps {
  phases: string[];
  boroughs: string[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
}

export default function SchoolFilters({
  phases,
  boroughs,
  filters,
  onChange,
  resultCount,
}: SchoolFiltersProps) {
  const set = (key: keyof FilterState, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm border border-gray-100">
      {/* Phase */}
      <select
        value={filters.phase}
        onChange={(e) => set("phase", e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 bg-white"
      >
        <option value="">All Phases</option>
        {phases.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {/* Ofsted */}
      <select
        value={filters.ofstedRating}
        onChange={(e) => set("ofstedRating", e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 bg-white"
      >
        <option value="">All Ratings</option>
        <option value="Outstanding">Outstanding</option>
        <option value="Good">Good</option>
        <option value="Requires improvement">Requires improvement</option>
        <option value="Inadequate">Inadequate</option>
      </select>

      {/* Borough */}
      <select
        value={filters.district}
        onChange={(e) => set("district", e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 bg-white"
      >
        <option value="">All Boroughs</option>
        {boroughs.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      {/* Search */}
      <input
        type="text"
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        placeholder="Search by name..."
        className="flex-1 min-w-[180px] rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 placeholder:text-gray-400"
      />

      {/* Result count */}
      <span className="text-sm text-gray-500 whitespace-nowrap">
        {resultCount} schools
      </span>
    </div>
  );
}
