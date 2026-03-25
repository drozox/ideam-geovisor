import { describe, expect, it } from "vitest";
import { getStationVisual } from "@/lib/stationVisuals";
import { createStation } from "@/test/fixtures";

describe("getStationVisual", () => {
  it("maps precipitation sensors to precipitation visuals", () => {
    const station = createStation({ descripcionsensor: "Precipitacion acumulada" });
    const visual = getStationVisual(station);

    expect(visual.key).toBe("precipitacion");
    expect(visual.symbol).toBe("P");
  });

  it("maps wind sensors to wind visuals", () => {
    const station = createStation({ descripcionsensor: "Velocidad del viento" });
    const visual = getStationVisual(station);

    expect(visual.key).toBe("viento");
    expect(visual.color).toBe("#f59e0b");
  });

  it("falls back to generic visual for unknown sensor type", () => {
    const station = createStation({ descripcionsensor: "Radiacion UV" });
    const visual = getStationVisual(station);

    expect(visual.key).toBe("otros");
    expect(visual.symbol).toBe("S");
  });
});

