"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ideamService } from "@/services/ideamServices";
import {
  defaultStationFilters,
  Station,
  StationFilters,
  StationFilterOptions,
} from "@/types/ideam";

function getUniqueSortedValues(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es-CO"),
  );
}

function filterStations(stations: Station[], filters: StationFilters): Station[] {
  if (
    !filters.departamento &&
    !filters.municipio &&
    !filters.descripcionsensor
  ) {
    return stations;
  }

  return stations.filter((station) => {
    const matchesDepartamento =
      !filters.departamento || station.departamento === filters.departamento;
    const matchesMunicipio =
      !filters.municipio || station.municipio === filters.municipio;
    const matchesSensor =
      !filters.descripcionsensor ||
      station.descripcionsensor === filters.descripcionsensor;

    return matchesDepartamento && matchesMunicipio && matchesSensor;
  });
}

function buildFilterOptions(
  stations: Station[],
  filters: StationFilters,
): StationFilterOptions {
  const departamentos = getUniqueSortedValues(
    stations.map((station) => station.departamento),
  );
  const municipiosBase = filters.departamento
    ? stations
        .filter((station) => station.departamento === filters.departamento)
        .map((station) => station.municipio)
    : stations.map((station) => station.municipio);
  const municipios = getUniqueSortedValues(municipiosBase);
  const tiposSensor = getUniqueSortedValues(
    stations.map((station) => station.descripcionsensor),
  );

  return {
    departamentos,
    municipios,
    tiposSensor,
  };
}

export function useStations(filters: StationFilters = defaultStationFilters) {
  const query = useQuery({
    queryKey: ["stations"],
    queryFn: () => ideamService.getStations(),
  });

  const stations = useMemo(() => query.data ?? [], [query.data]);
  const filteredStations = useMemo(
    () => filterStations(stations, filters),
    [stations, filters],
  );
  const filterOptions = useMemo(
    () => buildFilterOptions(stations, filters),
    [stations, filters],
  );

  return {
    stations,
    filteredStations,
    filterOptions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
