import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import StationHistoryPanel from "@/components/dashboard/StationHistoryPanel";
import { createStation } from "@/test/fixtures";

describe("StationHistoryPanel", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it("renders repeated timestamps without duplicate React key warnings", () => {
    render(
      <StationHistoryPanel
        station={createStation()}
        history={{
          stationCode: "001",
          stationName: "Estacion Centro",
          sensorCode: "S-001",
          sensorDescription: "Precipitacion",
          measurementUnit: "mm",
          points: [
            { observedAt: "2026-03-24T16:46:00.000Z", value: 12.4 },
            { observedAt: "2026-03-24T16:46:00.000Z", value: 11.8 },
            { observedAt: "2026-03-24T15:46:00.000Z", value: 9.1 },
          ],
        }}
        isLoading={false}
        isError={false}
        error={null}
        onRetry={() => undefined}
      />,
    );

    expect(screen.getByText("Ultimos registros")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Encountered two children with the same key"),
    );
  });
});
