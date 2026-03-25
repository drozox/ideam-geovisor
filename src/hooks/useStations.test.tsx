import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStations } from "@/hooks/useStations";
import { ideamService } from "@/services/ideamServices";
import { createStation } from "@/test/fixtures";
import { StationFilters } from "@/types/ideam";

vi.mock("@/services/ideamServices", () => ({
  ideamService: {
    getStations: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe("useStations", () => {
  beforeEach(() => {
    vi.mocked(ideamService.getStations).mockResolvedValue([
      createStation({
        codigoestacion: "001",
        departamento: "Cundinamarca",
        municipio: "Bogota",
        descripcionsensor: "Precipitacion",
      }),
      createStation({
        codigoestacion: "002",
        departamento: "Cundinamarca",
        municipio: "Soacha",
        descripcionsensor: "Temperatura",
      }),
      createStation({
        codigoestacion: "003",
        departamento: "Antioquia",
        municipio: "Medellin",
        descripcionsensor: "Viento",
      }),
    ]);
  });

  it("filters stations and rebuilds filter options from the fetched data", async () => {
    const filters: StationFilters = {
      departamento: "Cundinamarca",
      municipio: "Bogota",
      descripcionsensor: "",
    };

    const { result } = renderHook(() => useStations(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stations).toHaveLength(3);
    expect(result.current.filteredStations).toHaveLength(1);
    expect(result.current.filteredStations[0].codigoestacion).toBe("001");
    expect(result.current.filterOptions).toEqual({
      departamentos: ["Antioquia", "Cundinamarca"],
      municipios: ["Bogota", "Soacha"],
      tiposSensor: ["Precipitacion", "Temperatura", "Viento"],
    });
  });
});
