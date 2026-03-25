import { NextResponse } from "next/server";
import { historicalService } from "@/services/historicalService";

export async function GET() {
  try {
    const data = await historicalService.getDashboardSummary();
    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible cargar el resumen del dashboard.";

    return NextResponse.json({ error: message }, { status: 503 });
  }
}
