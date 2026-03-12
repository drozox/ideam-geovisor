"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface WeatherStation {
  id: string
  code: string
  name: string
  location: string
  coordinates: [number, number]
  sensorType: string
  lastReading: {
    temperature?: number
    humidity?: number
    pressure?: number
    windSpeed?: number
    date: string
  }
  entity: string
  hydroZone: string
}

interface WeatherMapProps {
  stations: WeatherStation[]
  selectedStation: WeatherStation | null
  onStationSelect: (station: WeatherStation) => void
}

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

// Component to handle map center updates
function MapUpdater({ coordinates }: { coordinates: [number, number] }) {
  const map = useMap()
  map.setView(coordinates, map.getZoom())
  return null
}

export default function WeatherMap({ stations, selectedStation, onStationSelect }: WeatherMapProps) {
  const defaultCenter: [number, number] = [4.6097, -74.0817] // Bogotá coordinates

  return (
    <MapContainer
      center={defaultCenter}
      zoom={6}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={station.coordinates}
          eventHandlers={{
            click: () => onStationSelect(station),
          }}
        >
          <Popup>
            <div className="font-medium">{station.name}</div>
            <div className="text-sm text-muted-foreground">{station.location}</div>
            <div className="text-sm">Código: {station.code}</div>
          </Popup>
        </Marker>
      ))}

      {selectedStation && (
        <MapUpdater coordinates={selectedStation.coordinates} />
      )}
    </MapContainer>
  )
}
