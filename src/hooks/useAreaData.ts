"use client";

import useSWR from "swr";
import type { AreaIntelligence } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * SWR hook that fetches aggregated area intelligence for a postcode.
 */
export function useAreaData(postcode: string | null) {
  const { data, error, isLoading } = useSWR<AreaIntelligence>(
    postcode ? `/api/area/${encodeURIComponent(postcode)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    data,
    isLoading,
    error,
  };
}
