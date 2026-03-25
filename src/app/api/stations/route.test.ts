import { describe, expect, it, vi } from "vitest";
import { ideamServerService } from "@/services/ideamServerService";
import { GET } from "@/app/api/stations/route";

vi.mock("@/services/ideamServerService", () => ({
  ideamServerService: {
    getStations: vi.fn(),
  },
}));

describe("GET /api/stations", () => {
  it("returns stations with cache headers", async () => {
    vi.mocked(ideamServerService.getStations).mockResolvedValue({
      data: [],
      meta: {
        source: "supabase",
        rawCount: 0,
        stationCount: 0,
        generatedAt: "2026-03-25T00:00:00.000Z",
        latestObservationAt: null,
      },
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "s-maxage=900, stale-while-revalidate=300",
    );
    await expect(response.json()).resolves.toMatchObject({
      data: [],
      meta: { source: "supabase" },
    });
  });

  it("returns a gateway error when the service fails", async () => {
    vi.mocked(ideamServerService.getStations).mockRejectedValue(new Error("boom"));

    const response = await GET();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: "boom",
    });
  });
});
