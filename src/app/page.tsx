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

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(47,173,186,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(6,53,61,0.18),_transparent_22%),linear-gradient(180deg,_#f4fbfb_0%,_#eef7f7_46%,_#f8fbfb_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[linear-gradient(180deg,_rgba(7,41,46,0.98)_0%,_rgba(9,55,61,0.94)_56%,_rgba(9,55,61,0)_100%)]" />

      <header className="relative z-10 border-b border-white/10 bg-transparent text-white">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <svg
                className="h-6 w-6 text-[#8ff0ff]"
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
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/60">
                Centro de monitoreo
              </p>
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-2xl">
                IDEAM Geovisor
              </h1>
              <p className="text-sm text-[#d4eef1]">
                Estaciones meteorologicas, lectura historica y mapa operativo
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <StatusPill label="Filtros activos" value={String(activeFiltersCount)} />
            <StatusPill
              label="Estaciones visibles"
              value={filteredStations.length.toLocaleString("es-CO")}
            />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div className="rounded-[2rem] border border-white/10 bg-[#0a3036]/92 p-6 text-white shadow-[0_28px_80px_rgba(4,18,22,0.28)] backdrop-blur-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#89deea]">
                Panorama operativo
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Monitorea el territorio con un dashboard mas claro, espacial y
                util para accion.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#cfe8eb] sm:text-base">
                Explora estaciones por ubicacion, detecta coberturas y revisa la
                evolucion historica desde una sola vista de trabajo.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <InfoChip label="Mapa" value="Interactivo" />
                <InfoChip label="Historico" value={selectedStation ? "Activo" : "Esperando seleccion"} />
                <InfoChip
                  label="Sensores"
                  value={summary ? summary.activeStationSensors.toLocaleString("es-CO") : "--"}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <SpotlightCard
                eyebrow="Cobertura"
                title={`${filteredStations.length.toLocaleString("es-CO")} estaciones en vista`}
                description="El listado y el mapa estan sincronizados para mantener contexto visual y exploracion rapida."
              />
              <SpotlightCard
                eyebrow="Seleccion actual"
                title={selectedStation ? selectedStation.nombreestacion : "Sin estacion seleccionada"}
                description={
                  selectedStation
                    ? `${selectedStation.municipio}, ${selectedStation.departamento}`
                    : "Selecciona una estacion para ver detalles y serie temporal."
                }
              />
            </div>
          </section>

          <DashboardSummaryPanel
            summary={summary}
            isLoading={isDashboardLoading}
            isError={isDashboardError}
            error={dashboardError}
            onRetry={() => void refetchDashboard()}
          />

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/80 shadow-[0_20px_55px_rgba(8,24,29,0.08)] backdrop-blur-sm xl:sticky xl:top-24 xl:h-[calc(100vh-7.5rem)] xl:min-h-0">
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
                <div className="overflow-hidden rounded-[1.9rem] border border-[#d6e9ea] bg-white/84 p-6 shadow-[0_24px_60px_rgba(8,24,29,0.1)] backdrop-blur-sm">
                  <div className="mb-5 flex flex-col gap-3 border-b border-[#d6e9ea] pb-5 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#0f7681]">
                        Exploracion espacial
                      </p>
                      <h2 className="mb-2 mt-3 text-xl font-semibold text-[#0b2429] sm:text-2xl">
                      Mapa de estaciones
                      </h2>
                      <p className="max-w-2xl text-sm leading-6 text-[#4b6970]">
                        Visualizacion geografica sincronizada con filtros, listado y
                        serie historica para explorar cobertura y comportamiento.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge label="Visible" value={filteredStations.length.toLocaleString("es-CO")} />
                      <StatusBadge
                        label="Seleccion"
                        value={selectedStation ? selectedStation.codigoestacion : "Ninguna"}
                      />
                    </div>
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
    <div className="flex h-96 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(180deg,_#edf7f7_0%,_#dceef0_100%)]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#0f7681]" />
        <h3 className="mb-2 text-lg font-semibold text-[#0b2429]">
          Cargando estaciones...
        </h3>
        <p className="mb-2 text-sm text-[#4f6e74]">
          Obteniendo datos de las estaciones meteorologicas.
        </p>
        <div className="mx-auto mt-4 h-2 w-64 rounded-full bg-white/70">
          <div className="h-2 animate-pulse rounded-full bg-[#0f7681]" />
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
    <div className="flex h-96 items-center justify-center rounded-[1.5rem] border border-rose-200 bg-[linear-gradient(180deg,_#fff7f8_0%,_#ffeef1_100%)]">
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
          <h3 className="mb-2 text-lg font-bold text-rose-700">
            Error al cargar las estaciones
          </h3>
        </div>

        <div className="mb-4 rounded-2xl border border-rose-100 bg-white/85 p-4 shadow-sm">
          <p className="mb-2 text-sm text-rose-600">{message}</p>
          <p className="text-xs text-[#667f84]">
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

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-right backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 backdrop-blur-sm">
      <span className="text-xs font-medium text-white/65">{label}: </span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}

function SpotlightCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/60 bg-white/74 p-5 shadow-[0_18px_45px_rgba(8,24,29,0.08)] backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#0f7681]">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-[#0b2429]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#58757b]">{description}</p>
    </div>
  );
}

function StatusBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-[#d7e9eb] bg-[#f4fbfb] px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#6f8c91]">
        {label}
      </span>
      <span className="ml-2 text-xs font-semibold text-[#12343a]">{value}</span>
    </div>
  );
}
