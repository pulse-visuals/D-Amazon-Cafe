import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { addOns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  await db
    .update(addOns)
    .set({
      name: typeof body.name === "string" ? body.name : undefined,
      price: typeof body.price === "number" ? Math.round(body.price) : undefined,
      active: typeof body.active === "boolean" ? body.active : undefined,
    })
    .where(eq(addOns.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;
  await db.delete(addOns).where(eq(addOns.id, id));
  return NextResponse.json({ ok: true });
}
