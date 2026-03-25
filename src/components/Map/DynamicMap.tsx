"use client";

import dynamic from "next/dynamic";
import { Station } from "@/types/ideam";

const BasicMap = dynamic(
  () => import("./BasicMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    ),
  },
);

interface DynamicMapProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
}

export default function DynamicMap({
  stations,
  selectedStation,
  onSelectStation,
}: DynamicMapProps) {
  return (
    <BasicMap
      stations={stations}
      selectedStation={selectedStation}
      onSelectStation={onSelectStation}
    />
  );
}
