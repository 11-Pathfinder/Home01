"use client";

import useSWR from "swr";
import type { School } from "@/lib/types";

interface AllSchoolsResponse {
  schools: (School & { district?: string })[];
  boroughs: string[];
  phases: string[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAllSchools() {
  const { data, error, isLoading } = useSWR<AllSchoolsResponse>(
    "/api/schools/all",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes — data rarely changes
    }
  );

  return { data, isLoading, error };
}
