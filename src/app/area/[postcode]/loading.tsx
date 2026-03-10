import { PanelSkeleton } from "@/components/ui/Skeleton";

export default function AreaLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-5 w-64 animate-pulse rounded bg-gray-200" />
        </div>
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
    </div>
  );
}
