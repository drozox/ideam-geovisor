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
      <section className="rounded-[1.8rem] border border-dashed border-[#b7d6db] bg-white/78 p-6 text-[#57747a] shadow-[0_18px_42px_rgba(8,24,29,0.06)] backdrop-blur-sm">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#638186]">
          <LineChart className="h-4 w-4" />
          Historico
        </p>
        <h3 className="mt-3 text-xl font-semibold text-[#0b2429]">
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
      <section className="rounded-[1.8rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_42px_rgba(8,24,29,0.06)] backdrop-blur-sm">
        <div className="h-56 animate-pulse rounded-[1.5rem] bg-[linear-gradient(180deg,_#eef7f8_0%,_#dff0f2_100%)]" />
      </section>
    );
  }

  if (isError || !history) {
    const message =
      error instanceof Error ? error.message : "No fue posible cargar el historico.";

    return (
      <section className="rounded-[1.8rem] border border-rose-200 bg-[linear-gradient(180deg,_#fff6f7_0%,_#ffecef_100%)] p-6 text-rose-900 shadow-[0_18px_42px_rgba(114,30,46,0.08)]">
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
  const average =
    values.reduce((total, value) => total + value, 0) / Math.max(values.length, 1);
  const range = max - min || 1;
  const normalizedPoints = history.points
    .slice()
    .reverse()
    .map((point, index, collection) => {
      const x = collection.length === 1 ? 4 : 4 + (index / (collection.length - 1)) * 92;
      const y = 88 - ((point.value - min) / range) * 72;

      return {
        observedAt: point.observedAt,
        value: point.value,
        x,
        y,
      };
    });
  const chartPoints = normalizedPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `4,88 ${chartPoints} 96,88`;
  const gridRows = [16, 40, 64, 88];

  const latestPoint = history.points[0];
  const firstPoint = history.points.at(-1);
  const change = latestPoint && firstPoint ? latestPoint.value - firstPoint.value : 0;
  const changeLabel =
    change === 0
      ? "Sin cambio"
      : `${change > 0 ? "+" : ""}${change.toFixed(2)} ${history.measurementUnit}`;
  const changeTone =
    change > 0 ? "text-emerald-300" : change < 0 ? "text-rose-300" : "text-slate-300";
  const statCards = [
    { label: "Minimo", value: min },
    { label: "Promedio", value: average },
    { label: "Maximo", value: max },
  ];

  return (
    <section className="rounded-[1.85rem] border border-white/70 bg-white/84 p-6 shadow-[0_22px_55px_rgba(8,24,29,0.08)] backdrop-blur-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0f7681]">
            Historico de estacion
          </p>
          <h3 className="mt-3 text-xl font-semibold text-[#0b2429] sm:text-2xl">
            {history.stationName}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {history.sensorDescription} - {history.measurementUnit} - Codigo{" "}
            {history.stationCode}
          </p>
        </div>
        <div className="rounded-[1.4rem] border border-[#dcebec] bg-[linear-gradient(180deg,_#f5fbfb_0%,_#e8f5f6_100%)] px-4 py-3 text-right shadow-inner">
          <p className="text-xs uppercase tracking-[0.22em] text-[#68858a]">
            Ultimo valor
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#0b2429]">
            {latestPoint?.value ?? "-"} {history.measurementUnit}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,_#081d21_0%,_#10333a_100%)] p-4 text-white shadow-[0_22px_55px_rgba(8,24,29,0.22)]">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7dcbd6]">
                Lectura temporal
              </p>
              <p className={`mt-2 text-sm font-medium ${changeTone}`}>{changeLabel}</p>
            </div>
            <div className="grid min-w-[220px] grid-cols-3 gap-2">
              {statCards.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm"
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#88b6be]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {item.value.toFixed(2)} {history.measurementUnit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-stretch">
            <div className="hidden justify-between py-3 text-[0.7rem] text-[#86b7c0] sm:flex sm:flex-col">
              <span>{max.toFixed(2)}</span>
              <span>{average.toFixed(2)}</span>
              <span>{min.toFixed(2)}</span>
            </div>

            <div className="rounded-[1.3rem] border border-white/8 bg-[linear-gradient(180deg,_rgba(255,255,255,0.03)_0%,_rgba(255,255,255,0.01)_100%)] p-3">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-56 w-full"
                role="img"
                aria-label="Serie historica de observaciones"
              >
                <defs>
                  <linearGradient id="history-area-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {gridRows.map((row) => (
                  <line
                    key={row}
                    x1="4"
                    y1={row}
                    x2="96"
                    y2={row}
                    stroke="rgba(167, 218, 226, 0.12)"
                    strokeWidth="0.8"
                    strokeDasharray="2 3"
                  />
                ))}

                <polygon points={areaPoints} fill="url(#history-area-fill)" />

                <polyline
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.6"
                  points={chartPoints}
                  vectorEffect="non-scaling-stroke"
                />

                {normalizedPoints.map((point, index) => {
                  const isLatest = index === normalizedPoints.length - 1;

                  return (
                    <circle
                      key={`${point.observedAt}-${point.value}-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r={isLatest ? 2.3 : 1.4}
                      fill={isLatest ? "#f8fdff" : "#22d3ee"}
                      stroke={isLatest ? "#22d3ee" : "none"}
                      strokeWidth={isLatest ? 1.4 : 0}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-[#b3d3d8]">
            <span>
              Inicio{" "}
              {firstPoint
                ? new Date(firstPoint.observedAt).toLocaleDateString("es-CO")
                : "-"}
            </span>
            <span className="hidden text-center text-[#87bfc8] sm:block">
              {history.points.length} registros mostrados
            </span>
            <span>
              Fin{" "}
              {latestPoint
                ? new Date(latestPoint.observedAt).toLocaleDateString("es-CO")
                : "-"}
            </span>
          </div>
        </div>

        <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,_#f6fbfb_0%,_#edf6f7_100%)] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#0b2429]">Ultimos registros</p>
            <span className="rounded-full bg-white/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#5f7f85]">
              {history.points.slice(0, 5).length} lecturas
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {history.points.slice(0, 5).map((point, index) => (
              <div
                key={`${point.observedAt}-${point.value}-${index}`}
                className="rounded-[1.15rem] border border-white bg-white/92 px-4 py-3 shadow-[0_10px_24px_rgba(8,24,29,0.05)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-sm font-semibold text-[#0d2f36]">
                      {point.value} {history.measurementUnit}
                    </span>
                    <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-[#7e9ca1]">
                      Muestra {index + 1}
                    </p>
                  </div>
                  <span className="text-right text-xs text-[#6a878c]">
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

