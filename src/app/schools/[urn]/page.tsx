"use client";

import { use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSchool } from "@/hooks/useSchool";
import { ofstedColor } from "@/lib/utils";
import type { School } from "@/lib/types";
import { PanelSkeleton } from "@/components/ui/Skeleton";

const SchoolDetailMap = dynamic(
  () => import("@/components/schools/SchoolDetailMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-gray-200 rounded-xl" />
    ),
  }
);

export default function SchoolDetailPage({
  params,
}: {
  params: Promise<{ urn: string }>;
}) {
  const { urn: urnStr } = use(params);
  const urn = parseInt(urnStr, 10);
  const { data, isLoading } = useSchool(isNaN(urn) ? null : urn);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-5xl px-4 py-8">
          <PanelSkeleton />
        </div>
      </div>
    );
  }

  if (!data?.school) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800">School not found</h1>
          <p className="mt-2 text-gray-500">URN {urnStr} does not exist in our database.</p>
          <Link href="/schools" className="mt-4 inline-block text-primary-600 hover:underline">
            Back to Schools Explorer
          </Link>
        </div>
      </div>
    );
  }

  const { school, nearby } = data;
  const color = ofstedColor(school.ofstedRating);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500">
          <Link href="/schools" className="text-primary-600 hover:underline">
            Schools Explorer
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{school.name}</span>
        </nav>

        {/* Title row */}
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow"
            style={{ backgroundColor: color }}
            title={school.ofstedRating || "Not rated"}
          >
            {school.ofstedRating ? school.ofstedRating.charAt(0) : "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{school.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              URN {school.urn} &middot; {school.postcode}
              {school.district && <> &middot; {school.district}</>}
            </p>
          </div>
        </div>

        {/* Info grid + map */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Info cards */}
          <div className="lg:col-span-2 space-y-4">
            <InfoCard title="Overview">
              <InfoRow label="Phase" value={school.phase} />
              <InfoRow label="Type" value={school.type} />
              <InfoRow
                label="Ofsted"
                value={school.ofstedRating || "Not rated"}
                color={color}
              />
              {school.lastInspectionDate && (
                <InfoRow label="Last inspection" value={school.lastInspectionDate} />
              )}
              {school.numberOfPupils != null && (
                <InfoRow label="Pupils" value={school.numberOfPupils.toLocaleString()} />
              )}
              {school.gender && <InfoRow label="Gender" value={school.gender} />}
              {school.religiousCharacter && (
                <InfoRow label="Religious character" value={school.religiousCharacter} />
              )}
            </InfoCard>

            {school.website && (
              <InfoCard title="Links">
                <a
                  href={
                    school.website.startsWith("http")
                      ? school.website
                      : `https://${school.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline break-all"
                >
                  {school.website}
                </a>
              </InfoCard>
            )}

            {/* Area link */}
            <InfoCard title="Area intelligence">
              <p className="text-sm text-gray-500 mb-2">
                See property prices, crime, transport, and demographics for this school&apos;s area.
              </p>
              <Link
                href={`/area/${encodeURIComponent(school.postcode)}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
              >
                View {school.postcode} area report &rarr;
              </Link>
            </InfoCard>
          </div>

          {/* Map */}
          <div className="lg:col-span-3 h-[400px] rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <SchoolDetailMap school={school} nearby={nearby} />
          </div>
        </div>

        {/* Nearby schools */}
        {nearby.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Nearby schools
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {nearby.map((s) => (
                <NearbyCard key={s.urn} school={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-primary-700 whitespace-nowrap">
          HomeScope
        </Link>
        <div className="flex-1" />
        <Link
          href="/schools"
          className="text-sm font-medium text-primary-600 whitespace-nowrap"
        >
          Schools Explorer
        </Link>
      </div>
    </header>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900" style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );
}

function NearbyCard({ school }: { school: School }) {
  const color = ofstedColor(school.ofstedRating);
  return (
    <Link
      href={`/schools/${school.urn}`}
      className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3 hover:bg-gray-50 transition-colors"
    >
      <div
        className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {school.ofstedRating ? school.ofstedRating.charAt(0) : "?"}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-gray-900 line-clamp-1">
          {school.name}
        </span>
        <div className="mt-0.5 flex gap-2 text-xs text-gray-500">
          <span>{school.phase}</span>
          {school.ofstedRating && (
            <span style={{ color }} className="font-medium">
              {school.ofstedRating}
            </span>
          )}
          {school.distance != null && (
            <span>{(school.distance * 1000).toFixed(0)}m away</span>
          )}
        </div>
      </div>
    </Link>
  );
}
