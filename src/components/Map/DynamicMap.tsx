"use client";

import dynamic from "next/dynamic";
import { Station } from "@/types/ideam";

const BasicMap = dynamic(
  () => import("./BasicMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center rounded-[1.7rem] bg-[linear-gradient(180deg,_#eef8f8_0%,_#dceef0_100%)]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#0f7681]"></div>
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
