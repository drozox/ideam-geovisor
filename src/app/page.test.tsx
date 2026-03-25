import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { createStation } from "@/test/fixtures";

vi.mock("@/components/Map/DynamicMap", () => ({
  default: () => React.createElement("div", { "data-testid": "dynamic-map" }, "Map"),
}));

vi.mock("@/hooks/useStations", () => ({
  useStations: () => ({
    filteredStations: [createStation()],
    filterOptions: {
      departamentos: ["Cundinamarca"],
      municipios: ["Bogota"],
      tiposSensor: ["Precipitacion"],
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/useDashboardSummary", () => ({
  useDashboardSummary: () => ({
    summary: {
      totalStations: 12,
      activeStationSensors: 18,
      staleStationSensors24h: 2,
      latestObservationAt: "2026-03-20T12:00:00Z",
      byDepartment: [{ label: "Cundinamarca", total: 8 }],
      bySensorCategory: [{ key: "precipitacion", label: "Precipitacion", total: 10 }],
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/useStationHistory", () => ({
  useStationHistory: () => ({
    history: null,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe("Home page layout", () => {
  it("renders dashboard summary and does not render the old filter toggle button in header", () => {
    render(React.createElement(Home));

    expect(screen.queryByLabelText("Abrir filtros")).not.toBeInTheDocument();
    expect(screen.getByText("IDEAM Geovisor")).toBeInTheDocument();
    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(screen.getByText("Estaciones monitoreadas")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
