import { Station } from "@/types/ideam";
import { getStationVisual } from "@/lib/stationVisuals";

export interface ClusteredStation {
  id: string;
  lat: number;
  lng: number;
  stations: Station[];
}

export interface StationLegendItem {
  key: string;
  label: string;
  color: string;
  symbol: string;
}

interface PixelPoint {
  x: number;
  y: number;
}

function latLngToPixel(lat: number, lng: number, zoom: number): PixelPoint {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const scale = 256 * 2 ** zoom;
  const x = ((lng + 180) / 360) * scale;
  const y =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

export function clusterStations(stations: Station[], zoom: number): ClusteredStation[] {
  if (zoom >= 11) {
    return stations.map((station) => ({
      id: `s-${station.codigoestacion}`,
      lat: station.latitud,
      lng: station.longitud,
      stations: [station],
    }));
  }

  const cellSize = zoom <= 7 ? 92 : zoom <= 9 ? 72 : 56;
  const buckets = new Map<string, ClusteredStation>();

  stations.forEach((station) => {
    const point = latLngToPixel(station.latitud, station.longitud, zoom);
    const key = `${Math.floor(point.x / cellSize)}:${Math.floor(point.y / cellSize)}`;
    const existing = buckets.get(key);

    if (!existing) {
      buckets.set(key, {
        id: `c-${key}`,
        lat: station.latitud,
        lng: station.longitud,
        stations: [station],
      });
      return;
    }

    existing.stations.push(station);
    const count = existing.stations.length;
    existing.lat = (existing.lat * (count - 1) + station.latitud) / count;
    existing.lng = (existing.lng * (count - 1) + station.longitud) / count;
  });

  return Array.from(buckets.values());
}

export function buildLegendItems(stations: Station[]): StationLegendItem[] {
  const unique = new Map<string, StationLegendItem>();

  stations.forEach((station) => {
    const visual = getStationVisual(station);
    if (!unique.has(visual.key)) {
      unique.set(visual.key, {
        key: visual.key,
        label: visual.label,
        color: visual.color,
        symbol: visual.symbol,
      });
    }
  });

  return Array.from(unique.values());
}

