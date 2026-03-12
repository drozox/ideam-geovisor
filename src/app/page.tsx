'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DynamicMap from '@/components/Map/DynamicMap';
import { useQuery } from '@tanstack/react-query';
import { ideamService } from '@/services/ideamServices';
import { X, Filter, ChevronDown, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';


export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    departamento: '',
    municipio: '',
    descripcionsensor: ''
  });
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [tiposSensor, setTiposSensor] = useState<string[]>([]);
  const [filteredMunicipios, setFilteredMunicipios] = useState<string[]>([]);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  
  // Obtener datos de estaciones para extraer departamentos, municipios y tipos de sensores
  const { data: stations } = useQuery({
    queryKey: ['stations'],
    queryFn: () => ideamService.getStations(),
  });
  
  // Filtrar estaciones según los filtros aplicados
  const filteredStations = React.useMemo(() => {
    if (!stations) return [];
    if (!filters.departamento && !filters.municipio && !filters.descripcionsensor) {
      return stations;
    }
    
    return stations.filter(station => {
      const matchDepartamento = !filters.departamento || station.departamento === filters.departamento;
      const matchMunicipio = !filters.municipio || station.municipio === filters.municipio;
      const matchSensor = !filters.descripcionsensor || station.descripcionsensor === filters.descripcionsensor;
      
      return matchDepartamento && matchMunicipio && matchSensor;
    });
  }, [stations, filters]);
  
  // Extraer departamentos, municipios y tipos de sensores únicos
  useEffect(() => {
    if (stations) {
      // Extraer departamentos únicos
      const uniqueDepartamentos = [...new Set(stations.map(station => station.departamento))].sort();
      setDepartamentos(uniqueDepartamentos);
      
      // Extraer municipios únicos
      const uniqueMunicipios = [...new Set(stations.map(station => station.municipio))].sort();
      setMunicipios(uniqueMunicipios);
      
      // Extraer tipos de sensores únicos
      const uniqueTiposSensor = [...new Set(stations.map(station => station.descripcionsensor))].sort();
      setTiposSensor(uniqueTiposSensor);
    }
  }, [stations]);
  
  // Filtrar municipios según el departamento seleccionado
  useEffect(() => {
    if (stations && filters.departamento) {
      const municipiosDelDepartamento = [...new Set(
        stations
          .filter(station => station.departamento === filters.departamento)
          .map(station => station.municipio)
      )].sort();
      setFilteredMunicipios(municipiosDelDepartamento);
    } else {
      setFilteredMunicipios(municipios);
    }
  }, [filters.departamento, municipios, stations]);
  
  // Manejar cambios en los filtros
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => {
      // Si cambia el departamento, resetear el municipio
      if (filterName === 'departamento') {
        return { ...prev, [filterName]: value, municipio: '' };
      }
      return { ...prev, [filterName]: value };
    });
  };
  
  // Aplicar filtros
  const applyFilters = () => {
    // Aquí se implementaría la lógica para aplicar los filtros
    console.log('Filtros aplicados:', filters);
    // Cerrar el sidebar en dispositivos móviles
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  
  // Resetear filtros
  const resetFilters = () => {
    setFilters({
      departamento: '',
      municipio: '',
      descripcionsensor: ''
    });
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative">
      {/* Header Moderno */}
      <header className="bg-[#00a3b4] text-white shadow-lg z-10 relative">
  <div className="flex items-center justify-between px-4 py-3">
    <div className="flex items-center gap-3">
      {/* Botón de filtros */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg text-white hover:bg-[#00b9cc] transition-all flex items-center gap-1"
        aria-label="Filtros"
      >
        <Filter size={18} />
        <span className="text-sm font-medium">Filtros</span>
      </button>
      
      {/* Logo y Título */}
      <div className="flex items-center gap-3">
        <div className="p-1">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            IDEAM Geovisor
          </h1>
          <p className="text-sm text-white opacity-90">
            Visualizador de Estaciones Meteorológicas
          </p>
        </div>
      </div>

      {/* Nav moderno */}
      <nav className="hidden md:flex gap-2">
        {["Dashboard", "Estaciones" ].map((item) => (
          <button
            key={item}
            className="px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#00b9cc] transition-all"
          >
            {item}
          </button>
        ))}
      </nav>
    </div>
  </div>
</header>


      {/* Sidebar para filtros */}
      <div className={`fixed top-24 bottom-0  left-0 z-20 w-80 bg-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out overflow-y-auto`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-6 flex-shrink-0 ">
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          {/* Filtro por Departamento */}
          <div className="mb-4">
            <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <div className="relative">
              <select
                id="departamento"
                value={filters.departamento}
                onChange={(e) => handleFilterChange('departamento', e.target.value)}
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-[#00a3b4] focus:outline-none focus:ring-1 focus:ring-[#00a3b4]"
              >
                <option value="">Todos los departamentos</option>
                {departamentos.map((depto) => (
                  <option key={depto} value={depto}>{depto}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
          
          {/* Filtro por Municipio */}
          <div className="mb-4">
            <label htmlFor="municipio" className="block text-sm font-medium text-gray-700 mb-1">
              Municipio
            </label>
            <div className="relative">
              <select
                id="municipio"
                value={filters.municipio}
                onChange={(e) => handleFilterChange('municipio', e.target.value)}
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-[#00a3b4] focus:outline-none focus:ring-1 focus:ring-[#00a3b4]"
                disabled={!filters.departamento}
              >
                <option value="">Todos los municipios</option>
                {filteredMunicipios.map((muni) => (
                  <option key={muni} value={muni}>{muni}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
          
          {/* Filtro por Tipo de Sensor */}
          <div className="mb-4">
            <label htmlFor="tipoSensor" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Sensor
            </label>
            <div className="relative">
              <select
                id="tipoSensor"
                value={filters.descripcionsensor}
                onChange={(e) => handleFilterChange('descripcionsensor', e.target.value)}
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-[#00a3b4] focus:outline-none focus:ring-1 focus:ring-[#00a3b4]"
              >
                <option value="">Todos los sensores</option>
                {tiposSensor.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={applyFilters}
              className="flex-1 bg-[#00a3b4] hover:bg-[#00b9cc] text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={resetFilters}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors"
            >
              Resetear
            </button>
          </div>
          
          {/* Lista de Estaciones */}
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Estaciones Meteorológicas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-200 overflow-y-auto">
                {filteredStations?.map((station) => (
                  <div
                    key={station.codigoestacion}
                    className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedStation?.codigoestacion === station.codigoestacion ? "bg-blue-50 border-l-4 border-l-[#00a3b4]" : ""
                    }`}
                    onClick={() => setSelectedStation(station)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">{station.nombreestacion}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {station.municipio}, {station.departamento}
                        </p>
                        <p className="text-xs text-gray-500">Código: {station.codigoestacion}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {station.descripcionsensor.split(" ")[0]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Overlay para cerrar el sidebar en móviles */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Contenido principal */}
      <div className={`max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${sidebarOpen ? 'md:ml-80' : ''}`}>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Mapa de Estaciones
            </h2>
            <p className="text-gray-600">
              Visualización del mapa base
            </p>
          </div>
          
          {/* Aquí va nuestro mapa */}
          <DynamicMap filters={filters} selectedStation={selectedStation} />
        </div>
      </div>
    </main>
  );
}