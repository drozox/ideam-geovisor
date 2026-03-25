"use client";

import { LineChart, Waves } from "lucide-react";
import { Station, StationHistoryResponse } from "@/types/ideam";

interface StationHistoryPanelProps {
  station: Station | null;
  history: StationHistoryResponse | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}

export default function StationHistoryPanel({
  station,
  history,
  isLoading,
  isError,
  error,
  onRetry,
}: StationHistoryPanelProps) {
  if (!station) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          <LineChart className="h-4 w-4" />
          Historico
        </p>
        <h3 className="mt-3 text-xl font-semibold text-slate-900">
          Selecciona una estacion para explorar su serie temporal.
        </h3>
        <p className="mt-2 max-w-2xl text-sm">
          Cuando elijas una estacion desde el listado o el mapa, aqui veras los
          ultimos registros historicos almacenados para ese sensor.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
      </section>
    );
  }

  if (isError || !history) {
    const message =
      error instanceof Error ? error.message : "No fue posible cargar el historico.";

    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em]">
          <Waves className="h-4 w-4" />
          Historico no disponible
        </p>
        <h3 className="mt-3 text-xl font-semibold">{station.nombreestacion}</h3>
        <p className="mt-2 text-sm text-rose-800">{message}</p>
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-rose-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-950"
        >
          Reintentar
        </button>
      </section>
    );
  }

  const values = history.points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const chartPoints = history.points
    .slice()
    .reverse()
    .map((point, index, collection) => {
      const x = collection.length === 1 ? 0 : (index / (collection.length - 1)) * 100;
      const y = 100 - ((point.value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const latestPoint = history.points[0];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#007b88]">
            Historico de estacion
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            {history.stationName}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {history.sensorDescription} · {history.measurementUnit} · Codigo{" "}
            {history.stationCode}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Ultimo valor
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {latestPoint?.value ?? "-"} {history.measurementUnit}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="rounded-2xl bg-slate-950 p-4 text-white">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-56 w-full"
            role="img"
            aria-label="Serie historica de observaciones"
          >
            <polyline
              fill="none"
              stroke="#22d3ee"
              strokeWidth="3"
              points={chartPoints}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
            <span>
              Inicio{" "}
              {history.points.at(-1)
                ? new Date(history.points.at(-1)!.observedAt).toLocaleDateString("es-CO")
                : "-"}
            </span>
            <span>
              Fin{" "}
              {latestPoint
                ? new Date(latestPoint.observedAt).toLocaleDateString("es-CO")
                : "-"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Ultimos registros</p>
          <div className="mt-3 space-y-3">
            {history.points.slice(0, 5).map((point, index) => (
              <div
                key={`${point.observedAt}-${point.value}-${index}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-900">
                    {point.value} {history.measurementUnit}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(point.observedAt).toLocaleString("es-CO", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
