"use client";

import dynamic from "next/dynamic";
import PostcodeSearch from "@/components/search/PostcodeSearch";

const AreaMap = dynamic(() => import("@/components/map/AreaMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-gray-200" />
  ),
});

export default function HomePage() {
  return (
    <div className="relative h-screen w-full">
      {/* Map background */}
      <div className="absolute inset-0 z-0">
        <AreaMap />
      </div>

      {/* Search overlay */}
      <div className="absolute inset-0 z-10 flex items-start justify-center pointer-events-none">
        <div className="mt-8 w-full max-w-2xl px-4 pointer-events-auto">
          <div className="rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm">
            <h1 className="mb-1 text-2xl font-bold text-gray-900">
              HomeScope London
            </h1>
            <p className="mb-4 text-sm text-gray-600">
              Area intelligence for home buyers. Prices, crime, schools,
              transport &mdash; all in one place.
            </p>
            <PostcodeSearch size="lg" />
          </div>
        </div>
      </div>

      {/* Attribution footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-white/80 px-4 py-1 text-center text-xs text-gray-500">
        Contains HM Land Registry data &copy; Crown copyright. Crime data from
        data.police.uk (Open Government Licence). School data &copy; Ofsted/DfE.
        Transport data &copy; TfL.
      </div>
    </div>
  );
}
