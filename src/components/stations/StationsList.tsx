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
    <section className="min-h-0 flex-1 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-800">Estaciones</h3>
        <Badge variant="outline">{stations.length}</Badge>
      </div>

      {stations.length > 600 ? (
        <p className="border-b border-gray-100 bg-amber-50/80 px-4 py-2 text-xs text-amber-700">
          Mostrando 600 estaciones para mantener la interfaz fluida.
        </p>
      ) : null}

      <div className="max-h-[calc(100vh-21rem)] overflow-y-auto px-3 py-3">
        {stations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
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
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        isSelected
          ? "border-[#00a3b4] bg-cyan-50"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
      onClick={() => onSelectStation(station)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="line-clamp-1 text-sm font-semibold text-gray-900">
            {station.nombreestacion}
          </p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
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

      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <p className="truncate">Codigo: {station.codigoestacion}</p>
        <p className="truncate text-right">
          {station.valorobservado} {station.unidadmedida}
        </p>
        <p className="col-span-2 truncate">Actualizado: {observedAt}</p>
      </div>
    </button>
  );
});
