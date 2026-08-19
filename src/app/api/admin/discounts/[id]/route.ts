import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { discountCodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  await db
    .update(discountCodes)
    .set({
      code: body.code ? String(body.code).toUpperCase() : undefined,
      type: body.type,
      value: typeof body.value === "number" ? Math.round(body.value) : undefined,
      minSpend: typeof body.minSpend === "number" ? Math.round(body.minSpend) : undefined,
      usageLimit: body.usageLimit === null ? null : typeof body.usageLimit === "number" ? body.usageLimit : undefined,
      active: typeof body.active === "boolean" ? body.active : undefined,
      expiresAt: body.expiresAt ?? undefined,
      description: typeof body.description === "string" ? body.description : undefined,
    })
    .where(eq(discountCodes.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;
  await db.delete(discountCodes).where(eq(discountCodes.id, id));
  return NextResponse.json({ ok: true });
}
