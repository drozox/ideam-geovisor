import { describe, expect, it } from "vitest";
import { buildLegendItems, clusterStations } from "@/lib/stationMap";
import { createStation } from "@/test/fixtures";

describe("clusterStations", () => {
  it("returns one marker per station at high zoom", () => {
    const stations = [
      createStation({ codigoestacion: "A1", latitud: 4.6, longitud: -74.08 }),
      createStation({ codigoestacion: "A2", latitud: 4.61, longitud: -74.1 }),
    ];

    const clusters = clusterStations(stations, 12);

    expect(clusters).toHaveLength(2);
    expect(clusters.every((entry) => entry.stations.length === 1)).toBe(true);
  });

  it("groups nearby points into clusters at low zoom", () => {
    const stations = [
      createStation({ codigoestacion: "A1", latitud: 4.6, longitud: -74.08 }),
      createStation({ codigoestacion: "A2", latitud: 4.6004, longitud: -74.0804 }),
      createStation({ codigoestacion: "A3", latitud: 4.6008, longitud: -74.0808 }),
    ];

    const clusters = clusterStations(stations, 6);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].stations).toHaveLength(3);
  });
});

describe("buildLegendItems", () => {
  it("builds unique legend entries from station sensor types", () => {
    const stations = [
      createStation({
        codigoestacion: "P1",
        descripcionsensor: "Precipitacion diaria",
      }),
      createStation({
        codigoestacion: "P2",
        descripcionsensor: "Precipitacion acumulada",
      }),
      createStation({
        codigoestacion: "T1",
        descripcionsensor: "Temperatura media",
      }),
    ];

    const legend = buildLegendItems(stations);

    expect(legend).toHaveLength(2);
    expect(legend.map((entry) => entry.key).sort()).toEqual([
      "precipitacion",
      "temperatura",
    ]);
  });
});

