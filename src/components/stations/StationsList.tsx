"use client";

import { memo, useMemo } from "react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/UI/badge";
import { Station } from "@/types/ideam";
import { getStationVisual } from "@/lib/stationVisuals";

interface StationsListProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
}

export default function StationsList({
  stations,
  selectedStation,
  onSelectStation,
}: StationsListProps) {
  const displayStations = useMemo(() => stations.slice(0, 600), [stations]);

  return (
    <section className="min-h-0 flex-1 overflow-hidden bg-[linear-gradient(180deg,_rgba(255,255,255,0.45)_0%,_rgba(244,250,250,0.95)_100%)]">
      <div className="flex items-center justify-between border-b border-[#dcebec] px-4 py-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#59767b]">
            Estaciones
          </h3>
          <p className="mt-1 text-xs text-[#6f8a90]">Listado sincronizado con el mapa</p>
        </div>
        <Badge variant="outline">{stations.length}</Badge>
      </div>

      {stations.length > 600 ? (
        <p className="border-b border-amber-100 bg-amber-50/90 px-4 py-2 text-xs text-amber-700">
          Mostrando 600 estaciones para mantener la interfaz fluida.
        </p>
      ) : null}

      <div className="max-h-[calc(100vh-21rem)] overflow-y-auto px-3 py-4">
        {stations.length === 0 ? (
          <div className="rounded-[1.2rem] border border-dashed border-[#c4dde0] bg-white/90 p-4 text-sm text-[#6b888d]">
            No hay estaciones que coincidan con los filtros actuales.
          </div>
        ) : null}

        <div className="space-y-2">
          {displayStations.map((station) => (
            <StationCard
              key={station.codigoestacion}
              station={station}
              isSelected={
                selectedStation?.codigoestacion === station.codigoestacion
              }
              onSelectStation={onSelectStation}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const StationCard = memo(function StationCard({
  station,
  isSelected,
  onSelectStation,
}: {
  station: Station;
  isSelected: boolean;
  onSelectStation: (station: Station) => void;
}) {
  const visual = getStationVisual(station);
  const observedAt = new Date(station.fechaobservacion).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <button
      type="button"
      className={`w-full rounded-[1.35rem] border p-4 text-left transition-all duration-200 ${
        isSelected
          ? "border-[#0f7681] bg-[linear-gradient(180deg,_#f4fcfd_0%,_#def3f5_100%)] shadow-[0_18px_38px_rgba(15,118,129,0.14)]"
          : "border-[#d8e8ea] bg-white/92 hover:-translate-y-0.5 hover:border-[#aad4d9] hover:bg-[#f7fbfb] hover:shadow-[0_14px_30px_rgba(8,24,29,0.06)]"
      }`}
      onClick={() => onSelectStation(station)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="line-clamp-1 text-sm font-semibold text-[#0b2429]">
            {station.nombreestacion}
          </p>
          <p className="flex items-center gap-1 text-xs text-[#69848a]">
            <MapPin className="h-3 w-3" />
            {station.municipio}, {station.departamento}
          </p>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 border-transparent text-white"
          style={{ backgroundColor: visual.color }}
        >
          {visual.label}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#5b777d]">
        <p className="truncate">Codigo: {station.codigoestacion}</p>
        <p className="truncate text-right">
          {station.valorobservado} {station.unidadmedida}
        </p>
        <p className="col-span-2 truncate text-[#0f7681]">Actualizado: {observedAt}</p>
      </div>
    </button>
  );
});
