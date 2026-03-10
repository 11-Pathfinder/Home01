import useSWR from "swr";
import type { School } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface SchoolDetailResponse {
  school: School & { district?: string };
  nearby: School[];
}

export function useSchool(urn: number | null) {
  return useSWR<SchoolDetailResponse>(
    urn ? `/api/schools/${urn}` : null,
    fetcher,
    { dedupingInterval: 300_000 }
  );
}
