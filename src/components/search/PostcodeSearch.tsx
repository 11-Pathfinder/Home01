"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { normalizePostcode } from "@/lib/utils";

interface PostcodeSearchProps {
  className?: string;
  size?: "lg" | "sm";
}

export default function PostcodeSearch({
  className = "",
  size = "lg",
}: PostcodeSearchProps) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    (postcode: string) => {
      const normalized = normalizePostcode(postcode);
      if (normalized.length < 5) return;
      router.push(`/area/${encodeURIComponent(normalized)}`);
    },
    [router]
  );

  const handleInputChange = async (val: string) => {
    setValue(val);
    const clean = val.replace(/\s+/g, "").toUpperCase();
    if (clean.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `/api/geocode?autocomplete=${encodeURIComponent(clean)}`
      );
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
      }
    } catch {
      // Autocomplete is best-effort
    }
  };

  const isLarge = size === "lg";

  return (
    <div className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(value);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter a London postcode (e.g. SW1A 1AA)"
          className={`flex-1 rounded-lg border border-gray-300 bg-white px-4 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 ${
            isLarge ? "py-4 text-lg" : "py-2 text-sm"
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`rounded-lg bg-primary-600 font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 ${
            isLarge ? "px-8 py-4 text-lg" : "px-4 py-2 text-sm"
          }`}
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      {/* Autocomplete dropdown */}
      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-primary-50"
                onClick={() => {
                  setValue(s);
                  setSuggestions([]);
                  handleSubmit(s);
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
