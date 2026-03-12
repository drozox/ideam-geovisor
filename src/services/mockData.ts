// src/services/mockData.ts
import { Station } from '@/types/ideam';

// Datos de ejemplo de estaciones del IDEAM
export const mockStations: Station[] = [
    {codigoestacion:"0027015334",
      codigosensor:"0257",
      fechaobservacion: "2025-08-23T06:26:00.000",
      valorobservado:0,
      nombreestacion:"AEROPUERTO OLAYA HERRERA",
      departamento:"ANTIOQUIA",
      municipio:"MEDELLÍN",
      zonahidrografica:"NECHÍ",
      latitud:6.4246389,
      longitud:-75.5882,
      descripcionsensor:"GPRS - PRECIPITACIÓN",
      unidadmedida:"mm",
      entidad:"INSTITUTO DE HIDROLOGIA METEOROLOGIA Y ESTUDIOS AMBIENTALES"
    }
  ,
  {codigoestacion:"0027015330",
      codigosensor:"0257",
      fechaobservacion: "2025-08-23T06:26:00.000",
      valorobservado:0,
      nombreestacion:"AEROPUERTO OLAYA HERRERA",
      departamento:"ANTIOQUIA",
      municipio:"MEDELLÍN",
      zonahidrografica:"NECHÍ",
      latitud:6.5246389,
      longitud:-75.5882,
      descripcionsensor:"GPRS - PRECIPITACIÓN",
      unidadmedida:"mm",
      entidad:"INSTITUTO DE HIDROLOGIA METEOROLOGIA Y ESTUDIOS AMBIENTALES"
    }
    ,
    {codigoestacion:"0027015331",
      codigosensor:"0257",
      fechaobservacion: "2025-08-23T06:26:00.000",
      valorobservado:0,
      nombreestacion:"AEROPUERTO OLAYA HERRERA",
      departamento:"ANTIOQUIA",
      municipio:"MEDELLÍN",
      zonahidrografica:"NECHÍ",
      latitud:6.7246389,
      longitud:-75.5882,
      descripcionsensor:"GPRS - PRECIPITACIÓN",
      unidadmedida:"mm",
      entidad:"INSTITUTO DE HIDROLOGIA METEOROLOGIA Y ESTUDIOS AMBIENTALES"
    }
    ,
    {codigoestacion:"0027015332",
      codigosensor:"0257",
      fechaobservacion: "2025-08-23T06:26:00.000",
      valorobservado:0,
      nombreestacion:"AEROPUERTO OLAYA HERRERA",
      departamento:"ANTIOQUIA",
      municipio:"MEDELLÍN",
      zonahidrografica:"NECHÍ",
      latitud:6.8246389,
      longitud:-75.5882,
      descripcionsensor:"GPRS - PRECIPITACIÓN",
      unidadmedida:"mm",
      entidad:"INSTITUTO DE HIDROLOGIA METEOROLOGIA Y ESTUDIOS AMBIENTALES"
    }
];

// Simulador de delay para API
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));