"use client";

import { Station } from "@/types/ideam";

interface StationPopupProps {
  station: Station;
}

export default function StationPopup({ station }: StationPopupProps) {
  return (
    <div className="min-w-72 rounded-[1.1rem] bg-[linear-gradient(180deg,_#ffffff_0%,_#f4fbfb_100%)] p-3">
      <h3 className="mb-3 text-sm font-bold text-[#0b2429]">
        {station.nombreestacion}
      </h3>
      <div className="space-y-2 text-xs text-[#33545b]">
        <p>
          <strong>Código estación:</strong> {station.codigoestacion}
        </p>
        <p>
          <strong>Código sensor:</strong> {station.codigosensor}
        </p>
        <p>
          <strong>Ubicación:</strong> {station.municipio}, {station.departamento}
        </p>
        <p>
          <strong>Zona hidrográfica:</strong> {station.zonahidrografica}
        </p>
        <p>
          <strong>Tipo de sensor:</strong> {station.descripcionsensor}
        </p>
        <p>
          <strong>Valor observado:</strong> {station.valorobservado}{" "}
          {station.unidadmedida}
        </p>
        <p>
          <strong>Entidad:</strong> {station.entidad}
        </p>
        <p className="pt-1 text-[#6d888e]">
          <strong>Fecha observación:</strong>{" "}
          {new Date(station.fechaobservacion).toLocaleString("es-CO", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </p>
      </div>
    </div>
  );
}
