import { NextResponse } from "next/server";
import { CATALOG } from "@/shared/catalog";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ catalog: CATALOG });
}
