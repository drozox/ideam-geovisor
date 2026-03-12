'use client';

import dynamic from 'next/dynamic';
import { StationFilters } from '@/types/ideam';

const BasicMap = dynamic(
  () => import('./BasicMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
);

interface DynamicMapProps {
  filters?: {
    departamento: string;
    municipio: string;
    descripcionsensor: string;
  };
  selectedStation?: any;
}

export default function DynamicMap({ filters, selectedStation }: DynamicMapProps) {
  return <BasicMap filters={filters} selectedStation={selectedStation} />;
}
