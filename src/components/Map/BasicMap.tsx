'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { ideamService } from '@/services/ideamServices';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Fix para los íconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para actualizar la vista del mapa cuando se selecciona una estación
function MapUpdater({ coordinates, zoom = 10 }: { coordinates: [number, number], zoom?: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(coordinates, zoom, {
      animate: true,
      duration: 1,
    });
  }, [coordinates, map, zoom]);
  
  return null;
}

interface BasicMapProps {
  filters?: {
    departamento: string;
    municipio: string;
    descripcionsensor: string;
  };
  selectedStation?: any;
}

export default function BasicMap({ filters, selectedStation: externalSelectedStation }: BasicMapProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedStation, setSelectedStation] = useState<null | any>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  const { data: stations, isLoading, error } = useQuery({
    queryKey: ['stations'],
    queryFn: () => ideamService.getStations(),
  });
  
  // Filtrar estaciones según los filtros aplicados
  const filteredStations = useMemo(() => {
    if (!stations) return [];
    if (!filters || (!filters.departamento && !filters.municipio && !filters.descripcionsensor)) {
      return stations;
    }
    
    return stations.filter(station => {
      const matchDepartamento = !filters.departamento || station.departamento === filters.departamento;
      const matchMunicipio = !filters.municipio || station.municipio === filters.municipio;
      const matchSensor = !filters.descripcionsensor || station.descripcionsensor === filters.descripcionsensor;
      
      return matchDepartamento && matchMunicipio && matchSensor;
    });
  }, [stations, filters]);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Sincronizar el estado de la estación seleccionada con la prop externa
  useEffect(() => {
    if (externalSelectedStation) {
      setSelectedStation(externalSelectedStation);
    }
  }, [externalSelectedStation]);

  // DEBUG: Vamos a ver qué está pasando con los datos
  console.log('Estado del componente:', { isLoading, error, stations });

  // Manejo de estados cuando el componente no está listo o está cargando
// Dentro del return de "if (!mounted || isLoading)"
if (!mounted || isLoading) {
  return (
    <div className="flex items-center justify-center h-96 bg-gray-100">
      <div className="text-center">
        {/* Ícono animado */}
        <svg
          className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin-slow"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          
        </svg>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {!mounted ? 'Inicializando mapa...' : 'Cargando estaciones...'}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {!mounted
            ? 'Preparando el visor geográfico'
            : 'Obteniendo datos de las estaciones meteorológicas'}
        </p>
        <p className="text-xs text-gray-500">
          {!mounted
            ? 'Estado: Inicializando componentes...'
            : 'Estado: Consultando base de datos...'}
        </p>
        <div className="mt-4 w-64 bg-gray-200 rounded-full h-2 mx-auto">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}


  // Manejo de errores con más detalle y opciones para el usuario
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold text-red-700 mb-2">
              Error al cargar las estaciones
            </h3>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <p className="text-sm text-red-600 mb-2">
              {error instanceof Error ? error.message : 'Error desconocido al obtener los datos'}
            </p>
            <p className="text-xs text-gray-500">
              Por favor, verifica tu conexión a internet y vuelve a intentarlo.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200"
          >
            Reintentar carga
          </button>
        </div>
      </div>
    );
  }

  // Función para determinar el color del marcador según el tipo de sensor
  const getSensorColor = (sensorType: string) => {
    if (sensorType.includes('PRECIPITACIÓN')) return '#0891b2'; // Azul
    if (sensorType.includes('TEMPERATURA')) return '#ef4444'; // Rojo
    if (sensorType.includes('HUMEDAD')) return '#22c55e'; // Verde
    if (sensorType.includes('PRESIÓN')) return '#6366f1'; // Índigo
    if (sensorType.includes('VIENTO')) return '#f59e0b'; // Ámbar
    return '#8b5cf6'; // Violeta para otros tipos
  };

  // Función para manejar la selección de una estación
  const handleStationSelect = (station: any) => {
    setSelectedStation(station);
  };

  return (
    <div className="h-[calc(90vh-6rem)] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">      
      <MapContainer
        center={[4.570868, -74.2973328]} // Centro de Colombia
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full"
        minZoom={6}
        maxZoom={18}
        ref={mapRef as any}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Renderizar marcadores de estaciones */}
        {filteredStations.map((station) => {
          // Crear icono personalizado basado en el tipo de sensor
          const iconColor = getSensorColor(station.descripcionsensor);
          
          const customIcon = L.divIcon({
            html: `
              <div style="
                background-color: ${iconColor};
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ${selectedStation?.codigoestacion === station.codigoestacion ? "transform: scale(1.3); border-color: #ec4899;" : ""}
              "></div>
            `,
            className: "custom-weather-marker",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          
          return (
            <Marker
              key={station.codigoestacion}
              position={[station.latitud, station.longitud]}
              icon={customIcon}
              eventHandlers={{
                click: () => handleStationSelect(station),
              }}
            >
              <Popup>
                <div className="p-2 min-w-64">
                  <h3 className="font-bold text-sm mb-2">{station.nombreestacion}</h3>
                  <div className="space-y-1 text-xs">
                    <p><strong>Código estación:</strong> {station.codigoestacion}</p>
                    <p><strong>Código sensor:</strong> {station.codigosensor}</p>
                    <p><strong>Ubicación:</strong> {station.municipio}, {station.departamento}</p>
                    <p><strong>Zona hidrográfica:</strong> {station.zonahidrografica}</p>
                    <p><strong>Tipo de sensor:</strong> {station.descripcionsensor}</p>
                    <p><strong>Valor observado:</strong> {station.valorobservado} {station.unidadmedida}</p>
                    <p><strong>Entidad:</strong> {station.entidad}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Fecha observación:</strong>{' '}
                      {new Date(station.fechaobservacion).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Actualizar vista del mapa cuando se selecciona una estación */}
        {selectedStation && (
          <MapUpdater 
            coordinates={[selectedStation.latitud, selectedStation.longitud]} 
          />
        )}
      </MapContainer>
    </div>
  );
}
