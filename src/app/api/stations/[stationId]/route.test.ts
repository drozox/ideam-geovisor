import { describe, expect, it, vi } from "vitest";
import { ideamServerService } from "@/services/ideamServerService";
import { GET } from "@/app/api/stations/[stationId]/route";

vi.mock("@/services/ideamServerService", () => ({
  ideamServerService: {
    getStationById: vi.fn(),
  },
}));

describe("GET /api/stations/[stationId]", () => {
  it("returns the station data when found", async () => {
    vi.mocked(ideamServerService.getStationById).mockResolvedValue({
      codigoestacion: "001",
      codigosensor: "S-001",
      fechaobservacion: "2026-03-24T20:00:00.000Z",
      valorobservado: 10,
      nombreestacion: "Estacion Centro",
      latitud: 4.6,
      longitud: -74.08,
      departamento: "Cundinamarca",
      municipio: "Bogota",
      zonahidrografica: "Magdalena",
      descripcionsensor: "Precipitacion",
      unidadmedida: "mm",
      entidad: "IDEAM",
    });

    const response = await GET(new Request("http://localhost/api/stations/001"), {
      params: Promise.resolve({ stationId: "001" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: { codigoestacion: "001" },
    });
  });

  it("returns 404 when the station is missing", async () => {
    vi.mocked(ideamServerService.getStationById).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/stations/404"), {
      params: Promise.resolve({ stationId: "404" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: "Estacion no encontrada.",
    });
  });
});
