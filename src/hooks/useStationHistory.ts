"use client";

import { useQuery } from "@tanstack/react-query";
import { ideamService } from "@/services/ideamServices";

export function useStationHistory(stationCode: string | null) {
  const query = useQuery({
    queryKey: ["station-history", stationCode],
    queryFn: () => ideamService.getStationHistory(stationCode!),
    enabled: Boolean(stationCode),
  });

  return {
    history: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
