"use client";

import { forwardRef } from "react";
import Link from "next/link";
import type { School } from "@/lib/types";
import { ofstedColor } from "@/lib/utils";

interface SchoolCardProps {
  school: School & { district?: string };
  isSelected?: boolean;
  onClick?: () => void;
}

const SchoolCard = forwardRef<HTMLDivElement, SchoolCardProps>(
  function SchoolCard({ school, isSelected, onClick }, ref) {
    const color = ofstedColor(school.ofstedRating);

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
          isSelected
            ? "border-primary-300 bg-primary-50"
            : "border-gray-100 hover:bg-gray-50"
        }`}
      >
        {/* Ofsted badge */}
        <div
          className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: color }}
          title={school.ofstedRating || "Not rated"}
        >
          {school.ofstedRating ? school.ofstedRating.charAt(0) : "?"}
        </div>

        <div className="flex-1 min-w-0">
          <span className="font-medium text-gray-900 text-sm leading-tight line-clamp-1">
            {school.name}
          </span>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
            <span>{school.phase}</span>
            {school.ofstedRating && (
              <span style={{ color }} className="font-medium">
                {school.ofstedRating}
              </span>
            )}
            {school.numberOfPupils != null && (
              <span>{school.numberOfPupils} pupils</span>
            )}
            {school.district && <span>{school.district}</span>}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-400">
            {school.gender && school.gender !== "Mixed" && (
              <span>{school.gender}</span>
            )}
            {school.religiousCharacter && (
              <span>{school.religiousCharacter}</span>
            )}
            {school.lastInspectionDate && (
              <span>Inspected {school.lastInspectionDate}</span>
            )}
          </div>
        </div>

        <Link
          href={`/schools/${school.urn}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 text-xs text-primary-600 hover:underline"
        >
          Details
        </Link>
      </div>
    );
  }
);

export default SchoolCard;
