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
            className="h-36 animate-pulse rounded-[1.7rem] border border-white/70 bg-white/75 shadow-[0_16px_40px_rgba(8,24,29,0.08)]"
          />
        ))}
      </section>
    );
  }

  if (isError || !summary) {
    const message =
      error instanceof Error ? error.message : "No fue posible cargar el dashboard.";

    return (
      <section className="rounded-[1.8rem] border border-amber-200/70 bg-[linear-gradient(135deg,_#fff7df_0%,_#fff1c8_100%)] p-5 text-amber-900 shadow-[0_16px_40px_rgba(122,74,12,0.08)]">
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
    cyan: "border-[#bbe7ec] bg-[linear-gradient(180deg,_#f4fcfd_0%,_#dcf5f8_100%)] text-[#0d3c43]",
    slate: "border-[#d7e6e8] bg-[linear-gradient(180deg,_#ffffff_0%,_#eef6f7_100%)] text-[#132f35]",
    amber: "border-[#f1d59f] bg-[linear-gradient(180deg,_#fff8e8_0%,_#ffecc0_100%)] text-[#714909]",
    emerald: "border-[#b9ebd8] bg-[linear-gradient(180deg,_#f1fdf7_0%,_#daf8e8_100%)] text-[#185a44]",
  } as const;

  return (
    <article className={`rounded-[1.7rem] border p-5 shadow-[0_18px_42px_rgba(8,24,29,0.07)] ${toneClasses[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-65">
            {title}
          </p>
          <p className="mt-4 text-2xl font-semibold tracking-tight sm:text-[1.85rem]">
            {value}
          </p>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/65 p-3 shadow-inner">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 opacity-80">{description}</p>
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
    <article className="rounded-[1.7rem] border border-[#d7e6e8] bg-white/86 p-5 shadow-[0_18px_42px_rgba(8,24,29,0.06)] backdrop-blur-sm">
      <h3 className="text-base font-semibold text-[#0b2429]">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[#678186]">{emptyLabel}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => {
            const width = maxValue === 0 ? 0 : Math.max((item.total / maxValue) * 100, 8);

            return (
              <div key={item.label} className="space-y-2 rounded-2xl bg-[#f5fafb] px-3 py-3">
                <div className="flex items-center justify-between gap-3 text-sm text-[#47656b]">
                  <span className="truncate">{item.label}</span>
                  <span className="font-semibold text-[#0d2f36]">{item.total}</span>
                </div>
                <div className="h-2 rounded-full bg-white">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,_#0f7681_0%,_#35b8c7_100%)]"
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
