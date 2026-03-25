"use client";

import { ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/UI/button";
import { StationFilterOptions, StationFilters } from "@/types/ideam";

interface FiltersSidebarProps {
  filters: StationFilters;
  options: StationFilterOptions;
  onFilterChange: (filterName: keyof StationFilters, value: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function FiltersSidebar({
  filters,
  options,
  onFilterChange,
  onApply,
  onReset,
}: FiltersSidebarProps) {
  const activeFiltersCount = [
    filters.departamento,
    filters.municipio,
    filters.descripcionsensor,
  ].filter(Boolean).length;

  return (
    <section className="border-b border-[#d7e7e9] bg-[linear-gradient(180deg,_rgba(244,251,251,0.96)_0%,_rgba(235,246,247,0.92)_100%)] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-[#cce7ea] bg-white/80 p-2">
            <Filter className="h-4 w-4 text-[#0f7681]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0b2429]">Filtros</h2>
            <p className="text-xs text-[#648086]">Refina la cobertura visible</p>
          </div>
        </div>
        <span className="rounded-full border border-[#cae8eb] bg-white/90 px-3 py-1 text-xs font-medium text-[#0f7681]">
          {activeFiltersCount} activos
        </span>
      </div>

      <FilterSelect
        id="departamento"
        label="Departamento"
        value={filters.departamento}
        options={options.departamentos}
        placeholder="Todos los departamentos"
        onChange={(value) => onFilterChange("departamento", value)}
      />

      <FilterSelect
        id="municipio"
        label="Municipio"
        value={filters.municipio}
        options={options.municipios}
        placeholder="Todos los municipios"
        disabled={!filters.departamento}
        onChange={(value) => onFilterChange("municipio", value)}
      />

      <FilterSelect
        id="sensor"
        label="Tipo de sensor"
        value={filters.descripcionsensor}
        options={options.tiposSensor}
        placeholder="Todos los sensores"
        onChange={(value) => onFilterChange("descripcionsensor", value)}
      />

      <div className="mt-5 flex gap-2">
        <Button className="flex-1 bg-[#00a3b4] hover:bg-[#00b9cc]" onClick={onApply}>
          Aplicar
        </Button>
        <Button className="flex-1" variant="outline" onClick={onReset}>
          Limpiar
        </Button>
      </div>
    </section>
  );
}

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function FilterSelect({
  id,
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block text-[13px] font-semibold text-[#3f5d63]">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="block w-full appearance-none rounded-2xl border border-[#cfe3e6] bg-white/95 py-3 pl-4 pr-10 text-sm text-[#12343a] shadow-[0_10px_22px_rgba(8,24,29,0.04)] focus:border-[#0f7681] focus:outline-none focus:ring-2 focus:ring-[#0f7681]/15 disabled:bg-[#edf3f4] disabled:text-[#8aa4a9]"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6a878c]">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}
