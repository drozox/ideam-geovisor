import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getSupabaseServerClient } from "@/lib/server/supabase";
import { ideamServerService } from "@/services/ideamServerService";

const select = vi.fn();
const order = vi.fn().mockReturnThis();
const returns = vi.fn();

vi.mock("@/lib/server/supabase", () => ({
  getSupabaseServerClient: vi.fn(),
}));

describe("ideamServerService", () => {
  beforeEach(() => {
    select.mockReturnThis();
    order.mockReturnThis();
    returns.mockReset();
    vi.mocked(getSupabaseServerClient).mockReturnValue({
      from: vi.fn(() => ({ select, order, returns })),
    } as never);
  });

  it("reads stations from Supabase and normalizes numeric fields", async () => {
    returns.mockResolvedValue({
      data: [
        {
          codigoestacion: "001",
          codigosensor: "S-001",
          fechaobservacion: "2026-03-24T15:00:00-05:00",
          valorobservado: "10.5",
          nombreestacion: "Estacion Centro",
          latitud: "4.6",
          longitud: "-74.08",
          departamento: "Cundinamarca",
          municipio: "Bogota",
          zonahidrografica: "Magdalena",
          descripcionsensor: "Precipitacion",
          unidadmedida: "mm",
          entidad: "IDEAM",
        },
      ],
      error: null,
    });

    const response = await ideamServerService.getStations();

    expect(select).toHaveBeenCalledWith(
      "codigoestacion, codigosensor, fechaobservacion, valorobservado, nombreestacion, latitud, longitud, departamento, municipio, zonahidrografica, descripcionsensor, unidadmedida, entidad",
    );
    expect(response.meta.source).toBe("supabase");
    expect(response.data).toEqual([
      {
        codigoestacion: "001",
        codigosensor: "S-001",
        fechaobservacion: "2026-03-24T20:00:00.000Z",
        valorobservado: 10.5,
        nombreestacion: "Estacion Centro",
        latitud: 4.6,
        longitud: -74.08,
        departamento: "Cundinamarca",
        municipio: "Bogota",
        zonahidrografica: "Magdalena",
        descripcionsensor: "Precipitacion",
        unidadmedida: "mm",
        entidad: "IDEAM",
      },
    ]);
  });
});
