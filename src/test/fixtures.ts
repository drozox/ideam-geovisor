import { Station } from "@/types/ideam";

export function createStation(partial: Partial<Station> = {}): Station {
  return {
    codigoestacion: "001",
    codigosensor: "S-001",
    fechaobservacion: "2026-03-15T12:00:00Z",
    valorobservado: 10,
    nombreestacion: "Estacion Centro",
    latitud: 4.6,
    longitud: -74.08,
    departamento: "Cundinamarca",
    municipio: "Bogota",
    zonahidrografica: "Magdalena",
    descripcionsensor: "Precipitacion",
    unidadmedida: "mm",
    entidad: "IDEAM",
    ...partial,
  };
}

