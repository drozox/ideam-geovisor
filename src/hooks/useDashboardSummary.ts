"use client";

import { useQuery } from "@tanstack/react-query";
import { ideamService } from "@/services/ideamServices";

export function useDashboardSummary() {
  const query = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => ideamService.getDashboardSummary(),
  });

  return {
    summary: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
