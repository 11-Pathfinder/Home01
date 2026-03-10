"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useAreaData } from "@/hooks/useAreaData";
import PostcodeSearch from "@/components/search/PostcodeSearch";
import PricePanel from "@/components/dashboard/PricePanel";
import CrimePanel from "@/components/dashboard/CrimePanel";
import SchoolsPanel from "@/components/dashboard/SchoolsPanel";
import TransportPanel from "@/components/dashboard/TransportPanel";
import DemographicsPanel from "@/components/dashboard/DemographicsPanel";
import AreaScore from "@/components/dashboard/AreaScore";
import { PanelSkeleton } from "@/components/ui/Skeleton";

const AreaMap = dynamic(() => import("@/components/map/AreaMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-gray-200 rounded-xl" />
  ),
});

export default function AreaPage() {
  const params = useParams();
  const postcode = decodeURIComponent(params.postcode as string);
  const { data, isLoading, error } = useAreaData(postcode);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <a href="/" className="text-lg font-bold text-primary-700 whitespace-nowrap">
            HomeScope
          </a>
          <PostcodeSearch size="sm" className="flex-1 max-w-md" />
          {data?.postcode && (
            <div className="hidden sm:block text-sm text-gray-600">
              <span className="font-medium">{data.postcode.postcode}</span>
              {" "}&middot; {data.postcode.district}
            </div>
          )}
        </div>
      </header>

      {/* Error state */}
      {error && (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-xl bg-red-50 p-6 text-red-700">
            <h2 className="text-lg font-semibold">Error</h2>
            <p>Could not load data for &quot;{postcode}&quot;. Please check the postcode and try again.</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-4 h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <PanelSkeleton />
              <PanelSkeleton />
            </div>
            <div className="space-y-6">
              <div className="h-80 animate-pulse rounded-xl bg-gray-200" />
              <PanelSkeleton />
            </div>
          </div>
        </div>
      )}

      {/* Data loaded */}
      {data && !isLoading && (
        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Area title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {data.postcode.postcode}
            </h1>
            <p className="text-gray-600">
              {data.postcode.ward_name}, {data.postcode.district}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column: main panels */}
            <div className="lg:col-span-2 space-y-6">
              {/* Area Score */}
              <AreaScore data={data} />

              {/* Prices */}
              {data.prices ? (
                <PricePanel data={data.prices} />
              ) : (
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Price Intelligence</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    No price data available. Run the data pipeline to load Land Registry data.
                  </p>
                </div>
              )}

              {/* Crime */}
              {data.crime ? (
                <CrimePanel data={data.crime} />
              ) : (
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Crime & Safety</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Crime data will load from the Police API.
                  </p>
                </div>
              )}
            </div>

            {/* Right column: map + secondary panels */}
            <div className="space-y-6">
              {/* Map */}
              <div className="h-80 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <AreaMap
                  center={[data.postcode.lat, data.postcode.lng]}
                  zoom={15}
                  marker={[data.postcode.lat, data.postcode.lng]}
                  schools={data.schools}
                  stations={data.transport}
                />
              </div>

              {/* Schools */}
              <SchoolsPanel schools={data.schools} />

              {/* Transport */}
              <TransportPanel stations={data.transport} />

              {/* Demographics */}
              {data.demographics && (
                <DemographicsPanel data={data.demographics} />
              )}
            </div>
          </div>

          {/* Attribution */}
          <footer className="mt-8 border-t border-gray-200 pt-4 pb-8 text-xs text-gray-500">
            Contains HM Land Registry data &copy; Crown copyright and database right.
            Crime data from data.police.uk under Open Government Licence.
            School data &copy; Crown copyright (Ofsted/DfE).
            Transport data &copy; Transport for London.
            Deprivation data: English Indices of Deprivation 2019, MHCLG.
            Map data &copy; OpenStreetMap contributors.
          </footer>
        </div>
      )}
    </div>
  );
}
