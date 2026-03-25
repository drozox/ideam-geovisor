import { describe, expect, it, vi } from "vitest";
import { historicalService } from "@/services/historicalService";
import { GET } from "@/app/api/dashboard/summary/route";

vi.mock("@/services/historicalService", () => ({
  historicalService: {
    getDashboardSummary: vi.fn(),
  },
}));

describe("GET /api/dashboard/summary", () => {
  it("returns the dashboard summary payload", async () => {
    vi.mocked(historicalService.getDashboardSummary).mockResolvedValue({
      totalStations: 12,
      activeStationSensors: 18,
      staleStationSensors24h: 2,
      latestObservationAt: "2026-03-24T20:00:00.000Z",
      byDepartment: [{ label: "Cundinamarca", total: 8 }],
      bySensorCategory: [{ key: "precipitacion", label: "Precipitacion", total: 10 }],
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: { totalStations: 12 },
    });
  });

  it("returns a service unavailable error on failure", async () => {
    vi.mocked(historicalService.getDashboardSummary).mockRejectedValue(
      new Error("boom"),
    );

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: "boom",
    });
  });
});
