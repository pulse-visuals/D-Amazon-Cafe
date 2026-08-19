import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { deliveryZones } from "@/lib/db/schema";
import { deliveryZoneSchema } from "@/lib/validators";
import { newId } from "@/lib/id";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const rows = await db.query.deliveryZones.findMany({ orderBy: asc(deliveryZones.sortOrder) });
  return NextResponse.json({ zones: rows });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const body = await req.json().catch(() => ({}));
  const parsed = deliveryZoneSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid delivery zone data.", details: parsed.error.flatten() }, { status: 400 });

  const id = newId("zone");
  await db.insert(deliveryZones).values({
    id,
    name: parsed.data.name,
    areaDescription: parsed.data.areaDescription || "",
    fee: Math.round(parsed.data.fee),
    minOrder: Math.round(parsed.data.minOrder),
    freeDeliveryThreshold: parsed.data.freeDeliveryThreshold != null ? Math.round(parsed.data.freeDeliveryThreshold) : null,
    active: parsed.data.active,
    sortOrder: 999,
  });
  return NextResponse.json({ id }, { status: 201 });
}
