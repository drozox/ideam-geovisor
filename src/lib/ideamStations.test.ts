import { describe, expect, it } from "vitest";
import { createStation } from "@/test/fixtures";
import {
  buildStationApiMeta,
  uniqueLatestStations,
} from "@/lib/ideamStations";

describe("ideamStations", () => {
  it("keeps the latest observation per station code", () => {
    const older = createStation({
      codigoestacion: "001",
      fechaobservacion: "2026-03-15T12:00:00Z",
      valorobservado: 5,
    });
    const newer = createStation({
      codigoestacion: "001",
      fechaobservacion: "2026-03-16T12:00:00Z",
      valorobservado: 10,
    });
    const another = createStation({
      codigoestacion: "002",
      fechaobservacion: "2026-03-14T12:00:00Z",
    });

    const result = uniqueLatestStations([older, another, newer]);

    expect(result).toHaveLength(2);
    expect(result.find((station) => station.codigoestacion === "001")?.valorobservado).toBe(10);
  });

  it("builds API metadata with latest observation timestamp", () => {
    const stations = [
      createStation({ fechaobservacion: "2026-03-14T12:00:00Z" }),
      createStation({
        codigoestacion: "002",
        fechaobservacion: "2026-03-18T08:30:00Z",
      }),
    ];

    const meta = buildStationApiMeta(stations, 12);

    expect(meta.rawCount).toBe(12);
    expect(meta.stationCount).toBe(2);
    expect(meta.latestObservationAt).toBe("2026-03-18T08:30:00Z");
    expect(meta.source).toBe("datos.gov.co/57sv-p2fu");
  });
});
