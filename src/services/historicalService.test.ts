import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getSupabaseServerClient } from "@/lib/server/supabase";
import { historicalService } from "@/services/historicalService";

const rpc = vi.fn();
let selectMock: ReturnType<typeof vi.fn>;
let queryBuilder: {
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  lte: ReturnType<typeof vi.fn>;
  returns: ReturnType<typeof vi.fn>;
};

vi.mock("@/lib/server/supabase", () => ({
  getSupabaseServerClient: vi.fn(),
}));

function createQueryBuilder() {
  queryBuilder = {
    eq: vi.fn(() => queryBuilder),
    order: vi.fn(() => queryBuilder),
    limit: vi.fn(() => queryBuilder),
    gte: vi.fn(() => queryBuilder),
    lte: vi.fn(() => queryBuilder),
    returns: vi.fn(),
  };

  selectMock = vi.fn(() => queryBuilder);
}

describe("historicalService", () => {
  beforeEach(() => {
    createQueryBuilder();
    vi.mocked(getSupabaseServerClient).mockReturnValue({
      rpc,
      from: vi.fn(() => ({ select: selectMock })),
    } as never);
    rpc.mockReset();
  });

  it("reads dashboard summary from Supabase RPC and normalizes the timestamp", async () => {
    rpc.mockResolvedValue({
      data: {
        totalStations: 12,
        activeStationSensors: 18,
        staleStationSensors24h: 2,
        latestObservationAt: "2026-03-24T15:00:00-05:00",
        byDepartment: [{ label: "Cundinamarca", total: 8 }],
        bySensorCategory: [{ key: "precipitacion", label: "Precipitacion", total: 10 }],
      },
      error: null,
    });

    const summary = await historicalService.getDashboardSummary();

    expect(rpc).toHaveBeenCalledWith("get_dashboard_summary");
    expect(summary.latestObservationAt).toBe("2026-03-24T20:00:00.000Z");
    expect(summary.totalStations).toBe(12);
    expect(summary.byDepartment).toEqual([{ label: "Cundinamarca", total: 8 }]);
  });

  it("builds the history query with filters and maps the points", async () => {
    queryBuilder.returns.mockResolvedValue({
      data: [
        {
          station_code: "001",
          station_name: "Estacion Centro",
          sensor_code: "S-001",
          sensor_description: "Precipitacion",
          measurement_unit: "mm",
          observed_at: "2026-03-24T15:00:00.000Z",
          observed_value: 10.2,
        },
        {
          station_code: "001",
          station_name: "Estacion Centro",
          sensor_code: "S-001",
          sensor_description: "Precipitacion",
          measurement_unit: "mm",
          observed_at: "2026-03-24T14:00:00.000Z",
          observed_value: 8.5,
        },
      ],
      error: null,
    });

    const history = await historicalService.getStationHistory({
      stationCode: "001",
      sensor: "S-001",
      from: "2026-03-24T00:00:00.000Z",
      to: "2026-03-25T00:00:00.000Z",
      limit: 9999,
    });

    expect(selectMock).toHaveBeenCalledWith(
      "station_code, station_name, sensor_code, sensor_description, measurement_unit, observed_at, observed_value",
    );
    expect(queryBuilder.eq).toHaveBeenCalledWith("station_code", "001");
    expect(queryBuilder.eq).toHaveBeenCalledWith("sensor_code", "S-001");
    expect(queryBuilder.gte).toHaveBeenCalledWith("observed_at", "2026-03-24T00:00:00.000Z");
    expect(queryBuilder.lte).toHaveBeenCalledWith("observed_at", "2026-03-25T00:00:00.000Z");
    expect(queryBuilder.limit).toHaveBeenCalledWith(5000);
    expect(history).toEqual({
      stationCode: "001",
      stationName: "Estacion Centro",
      sensorCode: "S-001",
      sensorDescription: "Precipitacion",
      measurementUnit: "mm",
      points: [
        { observedAt: "2026-03-24T15:00:00.000Z", value: 10.2 },
        { observedAt: "2026-03-24T14:00:00.000Z", value: 8.5 },
      ],
    });
  });

  it("returns null when the history read model has no rows", async () => {
    queryBuilder.returns.mockResolvedValue({ data: [], error: null });

    await expect(
      historicalService.getStationHistory({ stationCode: "missing" }),
    ).resolves.toBeNull();
  });
});
