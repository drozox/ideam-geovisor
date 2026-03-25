import { describe, expect, it, vi } from "vitest";
import { historicalService } from "@/services/historicalService";
import { GET } from "@/app/api/stations/[stationId]/history/route";

vi.mock("@/services/historicalService", () => ({
  historicalService: {
    getStationHistory: vi.fn(),
  },
}));

describe("GET /api/stations/[stationId]/history", () => {
  it("forwards query params to the history service", async () => {
    vi.mocked(historicalService.getStationHistory).mockResolvedValue({
      stationCode: "001",
      stationName: "Estacion Centro",
      sensorCode: "S-001",
      sensorDescription: "Precipitacion",
      measurementUnit: "mm",
      points: [{ observedAt: "2026-03-24T15:00:00.000Z", value: 10 }],
    });

    const response = await GET(
      new Request(
        "http://localhost/api/stations/001/history?sensor=S-001&from=2026-03-24T00:00:00.000Z&to=2026-03-25T00:00:00.000Z&limit=25",
      ),
      {
        params: Promise.resolve({ stationId: "001" }),
      },
    );

    expect(historicalService.getStationHistory).toHaveBeenCalledWith({
      stationCode: "001",
      sensor: "S-001",
      from: "2026-03-24T00:00:00.000Z",
      to: "2026-03-25T00:00:00.000Z",
      limit: 25,
    });
    expect(response.status).toBe(200);
  });

  it("returns 404 when there is no history", async () => {
    vi.mocked(historicalService.getStationHistory).mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost/api/stations/001/history"),
      {
        params: Promise.resolve({ stationId: "001" }),
      },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: "No se encontro historico para la estacion solicitada.",
    });
  });
});
