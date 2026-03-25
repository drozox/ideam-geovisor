"use client";

import { Station } from "@/types/ideam";

interface StationPopupProps {
  station: Station;
}

export default function StationPopup({ station }: StationPopupProps) {
  return (
    <div className="min-w-64 p-2">
      <h3 className="mb-2 text-sm font-bold text-gray-900">
        {station.nombreestacion}
      </h3>
      <div className="space-y-1 text-xs text-gray-700">
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
        <p className="pt-1 text-gray-500">
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
