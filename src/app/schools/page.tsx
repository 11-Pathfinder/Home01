"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAllSchools } from "@/hooks/useAllSchools";
import PostcodeSearch from "@/components/search/PostcodeSearch";
import SchoolFilters, {
  type FilterState,
} from "@/components/schools/SchoolFilters";
import SchoolCard from "@/components/schools/SchoolCard";
import { PanelSkeleton } from "@/components/ui/Skeleton";

const SchoolsMap = dynamic(
  () => import("@/components/schools/SchoolsMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-gray-200 rounded-xl" />
    ),
  }
);

export default function SchoolsPage() {
  const { data, isLoading } = useAllSchools();
  const [filters, setFilters] = useState<FilterState>({
    phase: "",
    ofstedRating: "",
    district: "",
    search: "",
  });
  const [selectedUrn, setSelectedUrn] = useState<number | null>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const filtered = useMemo(() => {
    if (!data?.schools) return [];
    return data.schools.filter((s) => {
      if (filters.phase && s.phase !== filters.phase) return false;
      if (filters.ofstedRating && s.ofstedRating !== filters.ofstedRating)
        return false;
      if (filters.district && s.district !== filters.district) return false;
      if (
        filters.search &&
        !s.name.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data?.schools, filters]);

  const handleMarkerClick = useCallback((urn: number) => {
    setSelectedUrn(urn);
    const el = cardRefs.current.get(urn);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleCardClick = useCallback((urn: number) => {
    setSelectedUrn(urn);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3">
          <a
            href="/"
            className="text-lg font-bold text-primary-700 whitespace-nowrap"
          >
            HomeScope
          </a>
          <PostcodeSearch size="sm" className="flex-1 max-w-md" />
          <a
            href="/schools"
            className="text-sm font-medium text-primary-600 whitespace-nowrap"
          >
            Schools Explorer
          </a>
        </div>
      </header>

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 p-6">
          <PanelSkeleton />
        </div>
      )}

      {/* Content */}
      {data && (
        <>
          {/* Filters */}
          <div className="mx-auto w-full max-w-[1600px] px-4 pt-4">
            <SchoolFilters
              phases={data.phases}
              boroughs={data.boroughs}
              filters={filters}
              onChange={setFilters}
              resultCount={filtered.length}
            />
          </div>

          {/* Map + Directory */}
          <div className="mx-auto flex flex-1 w-full max-w-[1600px] gap-4 px-4 py-4 overflow-hidden flex-col lg:flex-row">
            {/* Map */}
            <div className="lg:flex-[3] h-[350px] lg:h-auto rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <SchoolsMap
                schools={filtered}
                highlightedUrn={selectedUrn}
                onMarkerClick={handleMarkerClick}
              />
            </div>

            {/* Directory */}
            <div className="lg:flex-[2] flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filtered.length === 0 ? (
                  <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 text-center">
                    <p className="text-sm text-gray-500">
                      No schools match your filters.
                    </p>
                  </div>
                ) : (
                  filtered.map((school) => (
                    <SchoolCard
                      key={school.urn}
                      ref={(el) => {
                        if (el) cardRefs.current.set(school.urn, el);
                      }}
                      school={school}
                      isSelected={school.urn === selectedUrn}
                      onClick={() => handleCardClick(school.urn)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
