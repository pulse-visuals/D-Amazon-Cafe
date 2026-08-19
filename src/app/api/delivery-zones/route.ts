import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deliveryZones } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const zones = await db.query.deliveryZones.findMany({ where: eq(deliveryZones.active, true), orderBy: asc(deliveryZones.sortOrder) });
  return NextResponse.json({ zones });
}
