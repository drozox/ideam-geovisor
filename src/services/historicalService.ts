import "server-only";

import { getSupabaseServerClient } from "@/lib/server/supabase";
import {
  DashboardSummary,
  StationHistoryPoint,
  StationHistoryResponse,
} from "@/types/ideam";

type DashboardSummaryRpcResponse = DashboardSummary;

type ObservationReadModelRow = {
  station_code: string;
  station_name: string;
  sensor_code: string;
  sensor_description: string;
  measurement_unit: string;
  observed_at: string;
  observed_value: number;
};

function toIsoString(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export class HistoricalService {
  async getDashboardSummary(): Promise<DashboardSummary> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_dashboard_summary");

    if (error) {
      console.error("Error obteniendo resumen desde Supabase", error);
      throw new Error("No fue posible cargar el dashboard historico.");
    }

    const summary = (data ?? null) as DashboardSummaryRpcResponse | null;

    if (!summary) {
      return {
        totalStations: 0,
        activeStationSensors: 0,
        staleStationSensors24h: 0,
        latestObservationAt: null,
        byDepartment: [],
        bySensorCategory: [],
      };
    }

    return {
      ...summary,
      latestObservationAt: toIsoString(summary.latestObservationAt),
    };
  }

  async getStationHistory(input: {
    stationCode: string;
    sensor?: string | null;
    from?: string | null;
    to?: string | null;
    limit?: number;
  }): Promise<StationHistoryResponse | null> {
    const supabase = getSupabaseServerClient();
    const limit = Math.min(Math.max(input.limit ?? 500, 1), 5000);

    let query = supabase
      .from("observation_read_model")
      .select(
        "station_code, station_name, sensor_code, sensor_description, measurement_unit, observed_at, observed_value",
      )
      .eq("station_code", input.stationCode)
      .order("observed_at", { ascending: false })
      .limit(limit);

    if (input.sensor) {
      query = query.eq("sensor_code", input.sensor);
    }

    if (input.from) {
      query = query.gte("observed_at", input.from);
    }

    if (input.to) {
      query = query.lte("observed_at", input.to);
    }

    const { data, error } = await query.returns<ObservationReadModelRow[]>();

    if (error) {
      console.error("Error obteniendo historico desde Supabase", error);
      throw new Error("No fue posible cargar el historico de la estacion.");
    }

    if (!data || data.length === 0) {
      return null;
    }

    const first = data[0];
    const points: StationHistoryPoint[] = data.map((row) => ({
      observedAt: toIsoString(row.observed_at) ?? row.observed_at,
      value: Number(row.observed_value),
    }));

    return {
      stationCode: first.station_code,
      stationName: first.station_name,
      sensorCode: first.sensor_code,
      sensorDescription: first.sensor_description,
      measurementUnit: first.measurement_unit,
      points,
    };
  }
}

export const historicalService = new HistoricalService();
