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
    <section className="border-b border-gray-200 bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-[#00a3b4]" />
          <h2 className="text-base font-semibold text-gray-900">Filtros</h2>
        </div>
        <span className="rounded-full bg-[#00a3b4]/10 px-2 py-1 text-xs font-medium text-[#007b88]">
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

      <div className="mt-4 flex gap-2">
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
    <div className="mb-3">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-[#00a3b4] focus:outline-none focus:ring-1 focus:ring-[#00a3b4] disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}
