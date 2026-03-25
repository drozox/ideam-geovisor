import {
  DashboardSummary,
  Station,
  StationHistoryResponse,
  StationsApiResponse,
} from "@/types/ideam";

const API_URL = "/api/stations";

export class IdeamService {
  private async requestJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      throw new Error(body?.error ?? "No fue posible cargar datos del geovisor.");
    }

    return (await response.json()) as T;
  }

  async getStations(): Promise<Station[]> {
    try {
      const response = await this.requestJson<StationsApiResponse>(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo estaciones desde la API interna", error);
      throw new Error("No fue posible cargar las estaciones del IDEAM.");
    }
  }

  async getStationById(id: string): Promise<Station | undefined> {
    try {
      const response = await this.requestJson<{ data: Station }>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo estacion por id desde la API interna", error);
      throw new Error("No fue posible cargar la estación solicitada.");
    }
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const response = await this.requestJson<{ data: DashboardSummary }>(
        "/api/dashboard/summary",
      );
      return response.data;
    } catch (error) {
      console.error("Error obteniendo resumen del dashboard", error);
      throw new Error("No fue posible cargar el dashboard historico.");
    }
  }

  async getStationHistory(stationCode: string): Promise<StationHistoryResponse> {
    try {
      const response = await this.requestJson<{ data: StationHistoryResponse }>(
        `${API_URL}/${stationCode}/history`,
      );
      return response.data;
    } catch (error) {
      console.error("Error obteniendo historico de estacion", error);
      throw new Error("No fue posible cargar el historico de la estacion.");
    }
  }
}

export const ideamService = new IdeamService();
