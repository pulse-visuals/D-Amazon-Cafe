import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { deliveryZones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  await db
    .update(deliveryZones)
    .set({
      name: typeof body.name === "string" ? body.name : undefined,
      areaDescription: typeof body.areaDescription === "string" ? body.areaDescription : undefined,
      fee: typeof body.fee === "number" ? Math.round(body.fee) : undefined,
      minOrder: typeof body.minOrder === "number" ? Math.round(body.minOrder) : undefined,
      freeDeliveryThreshold: body.freeDeliveryThreshold === null ? null : typeof body.freeDeliveryThreshold === "number" ? Math.round(body.freeDeliveryThreshold) : undefined,
      active: typeof body.active === "boolean" ? body.active : undefined,
    })
    .where(eq(deliveryZones.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;
  await db.delete(deliveryZones).where(eq(deliveryZones.id, id));
  return NextResponse.json({ ok: true });
}
