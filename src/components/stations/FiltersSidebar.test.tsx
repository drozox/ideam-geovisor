import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FiltersSidebar from "@/components/stations/FiltersSidebar";
import { StationFilters } from "@/types/ideam";

describe("FiltersSidebar", () => {
  const filters: StationFilters = {
    departamento: "",
    municipio: "",
    descripcionsensor: "",
  };

  it("renders filters inside sidebar section and reports active count", () => {
    render(
      React.createElement(FiltersSidebar, {
        filters: { ...filters, departamento: "Cundinamarca" },
        options: {
          departamentos: ["Cundinamarca"],
          municipios: ["Bogota"],
          tiposSensor: ["Precipitacion"],
        },
        onFilterChange: vi.fn(),
        onApply: vi.fn(),
        onReset: vi.fn(),
      }),
    );

    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(screen.getByText("1 activos")).toBeInTheDocument();
  });

  it("calls filter callbacks when changing options and actions", () => {
    const onFilterChange = vi.fn();
    const onApply = vi.fn();
    const onReset = vi.fn();

    render(
      React.createElement(FiltersSidebar, {
        filters,
        options: {
          departamentos: ["Cundinamarca"],
          municipios: ["Bogota"],
          tiposSensor: ["Precipitacion"],
        },
        onFilterChange,
        onApply,
        onReset,
      }),
    );

    fireEvent.change(screen.getByLabelText("Departamento"), {
      target: { value: "Cundinamarca" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));
    fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));

    expect(onFilterChange).toHaveBeenCalledWith("departamento", "Cundinamarca");
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
