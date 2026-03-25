export interface Station {
  codigoestacion: string;
  codigosensor: string;
  fechaobservacion: string;
  valorobservado: number;
  nombreestacion: string;
  latitud: number;
  longitud: number;
  departamento: string;
  municipio: string;
  zonahidrografica: string;
  descripcionsensor: string;
  unidadmedida: string;
  entidad: string;
}

export interface StationFilters {
  departamento: string;
  municipio: string;
  descripcionsensor: string;
}

export interface StationFilterOptions {
  departamentos: string[];
  municipios: string[];
  tiposSensor: string[];
}

export interface StationApiMeta {
  source: string;
  rawCount: number;
  stationCount: number;
  generatedAt: string;
  latestObservationAt: string | null;
}

export interface StationsApiResponse {
  data: Station[];
  meta: StationApiMeta;
}

export interface DashboardCountItem {
  label: string;
  total: number;
}

export interface DashboardSensorCountItem {
  key: string;
  label: string;
  total: number;
}

export interface DashboardSummary {
  totalStations: number;
  activeStationSensors: number;
  staleStationSensors24h: number;
  latestObservationAt: string | null;
  byDepartment: DashboardCountItem[];
  bySensorCategory: DashboardSensorCountItem[];
}

export interface StationHistoryPoint {
  observedAt: string;
  value: number;
}

export interface StationHistoryResponse {
  stationCode: string;
  stationName: string;
  sensorCode: string;
  sensorDescription: string;
  measurementUnit: string;
  points: StationHistoryPoint[];
}

export interface RawStationApi {
  codigoestacion?: string | number | null;
  codigosensor?: string | number | null;
  fechaobservacion?: string | null;
  valorobservado?: string | number | null;
  nombreestacion?: string | null;
  latitud?: string | number | null;
  longitud?: string | number | null;
  departamento?: string | null;
  municipio?: string | null;
  zonahidrografica?: string | null;
  descripcionsensor?: string | null;
  unidadmedida?: string | null;
  entidad?: string | null;
}

export const defaultStationFilters: StationFilters = {
  departamento: "",
  municipio: "",
  descripcionsensor: "",
};
