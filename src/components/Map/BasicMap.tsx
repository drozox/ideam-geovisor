"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StationPopup from "@/components/stations/StationPopup";
import { Station } from "@/types/ideam";
import { getStationVisual } from "@/lib/stationVisuals";
import { buildLegendItems, clusterStations } from "@/lib/stationMap";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const COLOMBIA_CENTER: [number, number] = [4.570868, -74.2973328];

interface BasicMapProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
}

function createStationIcon(station: Station, isSelected: boolean) {
  const visual = getStationVisual(station);

  return L.divIcon({
    html: `
      <div style="
        background-color: ${visual.color};
        width: ${isSelected ? "28px" : "24px"};
        height: ${isSelected ? "28px" : "24px"};
        border-radius: 9999px;
        border: ${isSelected ? "3px solid #ec4899" : "2px solid #ffffff"};
        box-shadow: 0 3px 7px rgba(0, 0, 0, 0.25);
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      ">${visual.symbol}</div>
    `,
    className: "custom-weather-marker",
    iconSize: isSelected ? [28, 28] : [24, 24],
    iconAnchor: isSelected ? [14, 14] : [12, 12],
  });
}

function createClusterIcon(count: number) {
  const size = count > 50 ? 52 : count > 15 ? 46 : 40;
  const color = count > 50 ? "#0f766e" : count > 15 ? "#0ea5e9" : "#0284c7";

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        border: 3px solid #ffffff;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        background: ${color};
        color: #ffffff;
        font-size: 13px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      ">${count}</div>
    `,
    className: "custom-cluster-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapUpdater({ station }: { station: Station }) {
  const map = useMap();

  useEffect(() => {
    map.setView([station.latitud, station.longitud], 10, {
      animate: true,
      duration: 1,
    });
  }, [map, station]);

  return null;
}

function ViewportSync({
  stations,
  selectedStation,
  onSelectStation,
}: {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [bounds, setBounds] = useState(() => map.getBounds().pad(0.2));

  useMapEvents({
    moveend() {
      setBounds(map.getBounds().pad(0.2));
    },
    zoomend() {
      setZoom(map.getZoom());
      setBounds(map.getBounds().pad(0.2));
    },
  });

  const visibleStations = useMemo(
    () =>
      stations.filter((station) =>
        bounds.contains([station.latitud, station.longitud]),
      ),
    [stations, bounds],
  );

  const clusters = useMemo(
    () => clusterStations(visibleStations, zoom),
    [visibleStations, zoom],
  );

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.stations.length === 1) {
          const station = cluster.stations[0];
          const isSelected =
            selectedStation?.codigoestacion === station.codigoestacion;

          return (
            <Marker
              key={cluster.id}
              position={[station.latitud, station.longitud]}
              icon={createStationIcon(station, isSelected)}
              eventHandlers={{
                click: () => onSelectStation(station),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="text-xs">
                  <p className="font-semibold">{station.nombreestacion}</p>
                  <p>
                    {station.municipio}, {station.departamento}
                  </p>
                </div>
              </Tooltip>
              <Popup>
                <StationPopup station={station} />
              </Popup>
            </Marker>
          );
        }

        return (
          <Marker
            key={cluster.id}
            position={[cluster.lat, cluster.lng]}
            icon={createClusterIcon(cluster.stations.length)}
            eventHandlers={{
              click: () => {
                const groupBounds = L.latLngBounds(
                  cluster.stations.map((station) => [station.latitud, station.longitud]),
                );
                map.fitBounds(groupBounds.pad(0.25), { animate: true, duration: 0.8 });
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              {cluster.stations.length} estaciones
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}

function MapLegend({ stations }: { stations: Station[] }) {
  const legendItems = useMemo(() => buildLegendItems(stations), [stations]);

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-[500] max-w-52 rounded-[1.2rem] border border-white/60 bg-white/88 p-4 shadow-[0_18px_42px_rgba(8,24,29,0.12)] backdrop-blur-md">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#58757b]">
        Leyenda
      </h3>
      <div className="space-y-2">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs text-[#3d5d63]">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: item.color }}
            >
              {item.symbol}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-xs text-[#3d5d63]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-700 text-[10px] font-semibold text-white">
            #
          </span>
          <span>Cluster</span>
        </div>
      </div>
    </div>
  );
}

export default function BasicMap({
  stations,
  selectedStation,
  onSelectStation,
}: BasicMapProps) {
  return (
    <div className="relative h-[calc(90vh-6rem)] w-full overflow-hidden rounded-[1.7rem] border border-[#d7e7e9] shadow-[0_22px_55px_rgba(8,24,29,0.12)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[450] flex items-center justify-between px-4 py-4">
        <div className="rounded-full border border-white/12 bg-[#08252a]/84 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#c3e8ed] backdrop-blur-sm">
          Colombia · lectura espacial
        </div>
        <div className="rounded-full border border-white/12 bg-white/86 px-3 py-2 text-xs font-semibold text-[#0d2f36] shadow-[0_10px_24px_rgba(8,24,29,0.08)] backdrop-blur-sm">
          {stations.length.toLocaleString("es-CO")} estaciones
        </div>
      </div>
      <MapContainer
        center={COLOMBIA_CENTER}
        zoom={6}
        scrollWheelZoom
        className="h-full w-full"
        minZoom={6}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ViewportSync
          stations={stations}
          selectedStation={selectedStation}
          onSelectStation={onSelectStation}
        />

        {selectedStation ? <MapUpdater station={selectedStation} /> : null}
        <MapLegend stations={stations} />
      </MapContainer>
    </div>
  );
}
