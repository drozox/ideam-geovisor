import { RawStationApi, Station, StationApiMeta } from "@/types/ideam";

const DEFAULT_SOURCE = "datos.gov.co/57sv-p2fu";

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function parseNumber(value: string | number | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function normalizeStation(raw: RawStationApi): Station | null {
  const codigoestacion = normalizeText(raw.codigoestacion?.toString());
  const codigosensor = normalizeText(raw.codigosensor?.toString());
  const nombreestacion = normalizeText(raw.nombreestacion);
  const departamento = normalizeText(raw.departamento);
  const municipio = normalizeText(raw.municipio);
  const zonahidrografica = normalizeText(raw.zonahidrografica);
  const descripcionsensor = normalizeText(raw.descripcionsensor);
  const unidadmedida = normalizeText(raw.unidadmedida);
  const entidad = normalizeText(raw.entidad);
  const fechaobservacion = normalizeText(raw.fechaobservacion);
  const latitud = parseNumber(raw.latitud);
  const longitud = parseNumber(raw.longitud);
  const valorobservado = parseNumber(raw.valorobservado);

  const hasRequiredFields = [
    codigoestacion,
    codigosensor,
    nombreestacion,
    departamento,
    municipio,
    zonahidrografica,
    descripcionsensor,
    unidadmedida,
    entidad,
    fechaobservacion,
  ].every(Boolean);

  if (
    !hasRequiredFields ||
    latitud === null ||
    longitud === null ||
    valorobservado === null
  ) {
    return null;
  }

  return {
    codigoestacion,
    codigosensor,
    fechaobservacion,
    valorobservado,
    nombreestacion,
    latitud,
    longitud,
    departamento,
    municipio,
    zonahidrografica,
    descripcionsensor,
    unidadmedida,
    entidad,
  };
}

export function sortStationsByLatestObservation(stations: Station[]): Station[] {
  return [...stations].sort((left, right) => {
    const leftTime = Date.parse(left.fechaobservacion);
    const rightTime = Date.parse(right.fechaobservacion);

    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
      return left.codigoestacion.localeCompare(right.codigoestacion, "es-CO");
    }

    if (Number.isNaN(leftTime)) {
      return 1;
    }

    if (Number.isNaN(rightTime)) {
      return -1;
    }

    return rightTime - leftTime;
  });
}

export function uniqueLatestStations(stations: Station[]): Station[] {
  const map = new Map<string, Station>();

  sortStationsByLatestObservation(stations).forEach((station) => {
    if (!map.has(station.codigoestacion)) {
      map.set(station.codigoestacion, station);
    }
  });

  return Array.from(map.values());
}

export function buildStationApiMeta(
  stations: Station[],
  rawCount: number,
  source: string = DEFAULT_SOURCE,
): StationApiMeta {
  const latestObservationAt = stations.reduce<string | null>((latest, station) => {
    if (!latest) {
      return station.fechaobservacion;
    }

    return Date.parse(station.fechaobservacion) > Date.parse(latest)
      ? station.fechaobservacion
      : latest;
  }, null);

  return {
    source,
    rawCount,
    stationCount: stations.length,
    generatedAt: new Date().toISOString(),
    latestObservationAt,
  };
}
