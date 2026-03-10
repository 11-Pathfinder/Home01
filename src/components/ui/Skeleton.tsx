"use client";

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
    />
  );
}

export function PanelSkeleton() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}
