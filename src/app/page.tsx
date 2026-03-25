"use client";

import { useEffect, useState } from "react";
import DashboardSummaryPanel from "@/components/dashboard/DashboardSummaryPanel";
import StationHistoryPanel from "@/components/dashboard/StationHistoryPanel";
import DynamicMap from "@/components/Map/DynamicMap";
import { Card, CardContent } from "@/components/UI/card";
import FiltersSidebar from "@/components/stations/FiltersSidebar";
import StationsList from "@/components/stations/StationsList";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { useStationHistory } from "@/hooks/useStationHistory";
import { useStations } from "@/hooks/useStations";
import {
  defaultStationFilters,
  Station,
  StationFilters,
} from "@/types/ideam";

export default function Home() {
  const [filters, setFilters] = useState<StationFilters>(defaultStationFilters);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const {
    summary,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboardSummary();
  const {
    filteredStations,
    filterOptions,
    isLoading,
    isError,
    error,
    refetch,
  } = useStations(filters);
  const {
    history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
    refetch: refetchHistory,
  } = useStationHistory(selectedStation?.codigoestacion ?? null);

  useEffect(() => {
    if (
      selectedStation &&
      !filteredStations.some(
        (station) => station.codigoestacion === selectedStation.codigoestacion,
      )
    ) {
      setSelectedStation(null);
    }
  }, [filteredStations, selectedStation]);

  const handleFilterChange = (
    filterName: keyof StationFilters,
    value: string,
  ) => {
    setFilters((currentFilters) => {
      if (filterName === "departamento") {
        return {
          ...currentFilters,
          departamento: value,
          municipio: "",
        };
      }

      return {
        ...currentFilters,
        [filterName]: value,
      };
    });
  };

  const handleApplyFilters = () => {
    return;
  };

  const handleResetFilters = () => {
    setFilters(defaultStationFilters);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="relative z-10 bg-[#00a3b4] text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-1">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                IDEAM Geovisor
              </h1>
              <p className="text-sm text-white/90">
                Visualizador de estaciones meteorologicas
              </p>
            </div>
          </div>

          <nav className="hidden gap-2 md:flex">
            {["Dashboard", "Estaciones"].map((item) => (
              <button
                key={item}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-all hover:bg-[#00b9cc]"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <DashboardSummaryPanel
            summary={summary}
            isLoading={isDashboardLoading}
            isError={isDashboardError}
            error={dashboardError}
            onRetry={() => void refetchDashboard()}
          />

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm xl:sticky xl:top-24 xl:h-[calc(100vh-7.5rem)] xl:min-h-0">
              <div className="flex h-full min-h-0 flex-col">
                <FiltersSidebar
                  filters={filters}
                  options={filterOptions}
                  onFilterChange={handleFilterChange}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                />
                <StationsList
                  stations={filteredStations}
                  selectedStation={selectedStation}
                  onSelectStation={setSelectedStation}
                />
              </div>
            </aside>

            <Card className="overflow-hidden border-0 bg-transparent shadow-none">
              <CardContent className="space-y-4 p-0">
                <div className="rounded-lg bg-white p-6 shadow">
                  <div className="mb-4">
                    <h2 className="mb-2 text-xl font-semibold text-gray-900">
                      Mapa de estaciones
                    </h2>
                    <p className="text-gray-600">
                      Visualizacion geografica de estaciones IDEAM con filtros por
                      ubicacion y sensor.
                    </p>
                  </div>

                  {isLoading ? (
                    <LoadingState />
                  ) : isError ? (
                    <ErrorState
                      message={
                        error instanceof Error
                          ? error.message
                          : "Ocurrio un error al cargar las estaciones."
                      }
                      onRetry={() => void refetch()}
                    />
                  ) : (
                    <DynamicMap
                      stations={filteredStations}
                      selectedStation={selectedStation}
                      onSelectStation={setSelectedStation}
                    />
                  )}
                </div>

                <StationHistoryPanel
                  station={selectedStation}
                  history={history}
                  isLoading={isHistoryLoading}
                  isError={isHistoryError}
                  error={historyError}
                  onRetry={() => void refetchHistory()}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="flex h-96 items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          Cargando estaciones...
        </h3>
        <p className="mb-2 text-sm text-gray-600">
          Obteniendo datos de las estaciones meteorologicas.
        </p>
        <div className="mx-auto mt-4 h-2 w-64 rounded-full bg-gray-200">
          <div className="h-2 animate-pulse rounded-full bg-blue-600" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-96 items-center justify-center bg-red-50">
      <div className="mx-auto max-w-md p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mb-2 text-lg font-bold text-red-700">
            Error al cargar las estaciones
          </h3>
        </div>

        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm text-red-600">{message}</p>
          <p className="text-xs text-gray-500">
            Verifica tu conexion o el token configurado y vuelve a intentarlo.
          </p>
        </div>

        <button
          onClick={onRetry}
          className="rounded-md bg-red-600 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-red-700"
        >
          Reintentar carga
        </button>
      </div>
    </div>
  );
}
