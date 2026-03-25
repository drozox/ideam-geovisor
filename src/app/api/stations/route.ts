import { NextResponse } from "next/server";
import { ideamServerService } from "@/services/ideamServerService";

export async function GET() {
  try {
    const response = await ideamServerService.getStations();

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "s-maxage=900, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible cargar las estaciones del IDEAM.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 502 },
    );
  }
}
