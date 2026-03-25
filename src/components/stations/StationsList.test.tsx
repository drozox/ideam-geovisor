import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StationsList from "@/components/stations/StationsList";
import { createStation } from "@/test/fixtures";

describe("StationsList", () => {
  it("renders improved station card details and selection callback", () => {
    const station = createStation({
      codigoestacion: "A1",
      nombreestacion: "Estacion Norte",
      valorobservado: 25,
      unidadmedida: "mm",
    });
    const onSelectStation = vi.fn();

    render(
      React.createElement(StationsList, {
        stations: [station],
        selectedStation: null,
        onSelectStation,
      }),
    );

    expect(screen.getByText("Estacion Norte")).toBeInTheDocument();
    expect(screen.getByText("Codigo: A1")).toBeInTheDocument();
    expect(screen.getByText("25 mm")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Estacion Norte/i }));
    expect(onSelectStation).toHaveBeenCalledWith(station);
  });

  it("shows performance notice when result set is large", () => {
    const stations = Array.from({ length: 601 }, (_, idx) =>
      createStation({
        codigoestacion: `${idx + 1}`,
        nombreestacion: `Estacion ${idx + 1}`,
      }),
    );

    render(
      React.createElement(StationsList, {
        stations,
        selectedStation: null,
        onSelectStation: vi.fn(),
      }),
    );

    expect(
      screen.getByText("Mostrando 600 estaciones para mantener la interfaz fluida."),
    ).toBeInTheDocument();
  });
});
