"use client";

import type { ReactNode } from "react";
import { Activity, Database, MapPinned, TriangleAlert } from "lucide-react";
import { DashboardSummary } from "@/types/ideam";

interface DashboardSummaryPanelProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}

export default function DashboardSummaryPanel({
  summary,
  isLoading,
  isError,
  error,
  onRetry,
}: DashboardSummaryPanelProps) {
  if (isLoading) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </section>
    );
  }

  if (isError || !summary) {
    const message =
      error instanceof Error ? error.message : "No fue posible cargar el dashboard.";

    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em]">
              <TriangleAlert className="h-4 w-4" />
              Dashboard historico no disponible
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              El mapa funciona, pero la base historica aun no responde.
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-amber-800">
              {message} Levanta PostGIS, aplica migraciones y ejecuta la ingesta
              inicial para habilitar los indicadores y las series temporales.
            </p>
          </div>
          <button
            onClick={onRetry}
            className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-950"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  const latestTimestamp = summary.latestObservationAt
    ? new Date(summary.latestObservationAt).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Sin datos";

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Estaciones monitoreadas"
          value={summary.totalStations.toLocaleString("es-CO")}
          description="Estaciones con historico almacenado"
          icon={<MapPinned className="h-5 w-5" />}
          tone="cyan"
        />
        <MetricCard
          title="Sensores activos"
          value={summary.activeStationSensors.toLocaleString("es-CO")}
          description="Ultima observacion disponible por sensor"
          icon={<Activity className="h-5 w-5" />}
          tone="slate"
        />
        <MetricCard
          title="Sensores sin reporte 24h"
          value={summary.staleStationSensors24h.toLocaleString("es-CO")}
          description="Posibles puntos caidos o atrasados"
          icon={<TriangleAlert className="h-5 w-5" />}
          tone="amber"
        />
        <MetricCard
          title="Ultima observacion"
          value={latestTimestamp}
          description="Marca temporal mas reciente en la base"
          icon={<Database className="h-5 w-5" />}
          tone="emerald"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <BreakdownCard
          title="Cobertura por departamento"
          items={summary.byDepartment.slice(0, 6)}
          emptyLabel="Sin departamentos cargados"
        />
        <BreakdownCard
          title="Sensores por categoria"
          items={summary.bySensorCategory.slice(0, 6).map((item) => ({
            label: item.label,
            total: item.total,
          }))}
          emptyLabel="Sin categorias disponibles"
        />
      </div>
    </section>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone: "cyan" | "slate" | "amber" | "emerald";
}) {
  const toneClasses = {
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-900",
    slate: "border-slate-200 bg-slate-50 text-slate-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  } as const;

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="rounded-xl bg-white/70 p-3">{icon}</div>
      </div>
      <p className="mt-3 text-sm opacity-80">{description}</p>
    </article>
  );
}

function BreakdownCard({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: Array<{ label: string; total: number }>;
  emptyLabel: string;
}) {
  const maxValue = Math.max(...items.map((item) => item.total), 0);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => {
            const width = maxValue === 0 ? 0 : Math.max((item.total / maxValue) * 100, 8);

            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                  <span className="truncate">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.total}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#00a3b4]"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
