"use client";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}

export default function StatCard({ label, value, sub, className = "" }: StatCardProps) {
  return (
    <div className={`rounded-lg bg-white p-4 shadow-sm border border-gray-100 ${className}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-500">{sub}</div>}
    </div>
  );
}
