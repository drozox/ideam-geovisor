import { NextResponse } from "next/server";
import { historicalService } from "@/services/historicalService";

export async function GET(
  request: Request,
  context: { params: Promise<{ stationId: string }> },
) {
  try {
    const { stationId } = await context.params;
    const url = new URL(request.url);
    const history = await historicalService.getStationHistory({
      stationCode: stationId,
      sensor: url.searchParams.get("sensor"),
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
      limit: url.searchParams.get("limit")
        ? Number(url.searchParams.get("limit"))
        : undefined,
    });

    if (!history) {
      return NextResponse.json(
        { error: "No se encontro historico para la estacion solicitada." },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: history });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible cargar el historico solicitado.";

    return NextResponse.json({ error: message }, { status: 503 });
  }
}
