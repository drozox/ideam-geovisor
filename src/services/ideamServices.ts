import axios from 'axios';
import { Station } from '@/types/ideam';

const API_URL = 'https://www.datos.gov.co/resource/57sv-p2fu.json';
const APP_TOKEN = process.env.NEXT_PUBLIC_IDEAM_APP_TOKEN;

function uniqueStations(stations: Station[]): Station[] {
  const map = new Map<string, Station>();
  stations.forEach(st => {
    if (!map.has(st.codigoestacion)) {
      map.set(st.codigoestacion, st);
    }
  });
  return Array.from(map.values());
}

export class IdeamService {
  async getStations(): Promise<Station[]> {
    try {
      const response = await axios.get<Station[]>(API_URL, {
        params: {
          $limit: 5000,
          $$app_token: APP_TOKEN,
        },
      });

      return uniqueStations(response.data);
    } catch (error) {
      console.error('Error obteniendo estaciones del IDEAM', error);
      return [];
    }
  }

  async getStationById(id: string): Promise<Station | undefined> {
    try {
      const response = await axios.get<Station[]>(API_URL, {
        params: {
          codigoestacion: id,
          $$app_token: APP_TOKEN,
        },
      });

      return response.data[0];
    } catch (error) {
      console.error('Error obteniendo estación por id', error);
      return undefined;
    }
  }

  async getFilteredStations(filters: {
    departamento?: string;
    municipio?: string;
    categoria?: string;
  }): Promise<Station[]> {
    try {
      const response = await axios.get<Station[]>(API_URL, {
        params: {
          ...filters,
          $limit: 5000,
          $$app_token: APP_TOKEN,
        },
      });

      return uniqueStations(response.data);
    } catch (error) {
      console.error('Error filtrando estaciones', error);
      return [];
    }
  }
}

export const ideamService = new IdeamService();
