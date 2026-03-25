import "server-only";

import { buildStationApiMeta } from "@/lib/ideamStations";
import { getSupabaseServerClient } from "@/lib/server/supabase";
import { Station, StationsApiResponse } from "@/types/ideam";

type StationLatestSnapshotRow = Station;

function normalizeIsoDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

export class IdeamServerService {
  private async fetchStationsFromSupabase(): Promise<Station[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("station_latest_snapshot")
      .select(
        "codigoestacion, codigosensor, fechaobservacion, valorobservado, nombreestacion, latitud, longitud, departamento, municipio, zonahidrografica, descripcionsensor, unidadmedida, entidad",
      )
      .order("fechaobservacion", { ascending: false })
      .returns<StationLatestSnapshotRow[]>();

    if (error) {
      console.error("Error obteniendo estaciones desde Supabase", error);
      throw new Error("No fue posible cargar las estaciones desde Supabase.");
    }

    return (data ?? []).map((station) => ({
      ...station,
      fechaobservacion: normalizeIsoDate(station.fechaobservacion),
      valorobservado: Number(station.valorobservado),
      latitud: Number(station.latitud),
      longitud: Number(station.longitud),
    }));
  }

  async getStations(): Promise<StationsApiResponse> {
    try {
      const stations = await this.fetchStationsFromSupabase();

      return {
        data: stations,
        meta: buildStationApiMeta(stations, stations.length, "supabase"),
      };
    } catch (error) {
      console.error("Error obteniendo estaciones", error);
      throw new Error("No fue posible cargar las estaciones del geovisor.");
    }
  }

  async getStationById(stationCode: string): Promise<Station | null> {
    const response = await this.getStations();

    return (
      response.data.find((station) => station.codigoestacion === stationCode) ?? null
    );
  }
}

export const ideamServerService = new IdeamServerService();
