import { Station } from "@/types/ideam";

export interface StationVisual {
  key: string;
  label: string;
  color: string;
  symbol: string;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export function getStationVisual(station: Station): StationVisual {
  const sensor = normalize(station.descripcionsensor);

  if (sensor.includes("PRECIPITACION") || sensor.includes("PLUVI")) {
    return {
      key: "precipitacion",
      label: "Precipitacion",
      color: "#0ea5e9",
      symbol: "P",
    };
  }

  if (sensor.includes("TEMPERATURA") || sensor.includes("TERM")) {
    return {
      key: "temperatura",
      label: "Temperatura",
      color: "#ef4444",
      symbol: "T",
    };
  }

  if (sensor.includes("HUMEDAD")) {
    return {
      key: "humedad",
      label: "Humedad",
      color: "#22c55e",
      symbol: "H",
    };
  }

  if (sensor.includes("PRESION")) {
    return {
      key: "presion",
      label: "Presion",
      color: "#6366f1",
      symbol: "R",
    };
  }

  if (sensor.includes("VIENTO")) {
    return {
      key: "viento",
      label: "Viento",
      color: "#f59e0b",
      symbol: "V",
    };
  }

  if (sensor.includes("NIVEL") || sensor.includes("CAUDAL")) {
    return {
      key: "hidrologia",
      label: "Nivel/Caudal",
      color: "#06b6d4",
      symbol: "N",
    };
  }

  return {
    key: "otros",
    label: "Otros",
    color: "#64748b",
    symbol: "S",
  };
}

