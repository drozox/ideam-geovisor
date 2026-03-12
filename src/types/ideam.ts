// src/types/ideam.ts

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

export interface StationData {
  fecha: string;
  temperatura?: number;
  humedad?: number;
  precipitacion?: number;
  viento?: {
    velocidad: number;
    direccion: number;
  };
  presion?: number;
}

// Para filtros
export interface StationFilters {
  departamento?: string;
  categoria?: string;
  descripcionsensor?: string;

}