import { NextResponse } from "next/server";
import { ideamServerService } from "@/services/ideamServerService";

export async function GET(
  _request: Request,
  context: { params: Promise<{ stationId: string }> },
) {
  try {
    const { stationId } = await context.params;
    const station = await ideamServerService.getStationById(stationId);

    if (!station) {
      return NextResponse.json(
        { error: "Estacion no encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: station });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible cargar la estacion solicitada.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 502 },
    );
  }
}
