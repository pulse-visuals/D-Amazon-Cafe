import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { discountCodes } from "@/lib/db/schema";
import { discountCodeSchema } from "@/lib/validators";
import { newId } from "@/lib/id";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const rows = await db.query.discountCodes.findMany();
  return NextResponse.json({ discounts: rows });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const body = await req.json().catch(() => ({}));
  const parsed = discountCodeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid discount data.", details: parsed.error.flatten() }, { status: 400 });

  const id = newId("disc");
  await db.insert(discountCodes).values({
    id,
    code: parsed.data.code.toUpperCase(),
    type: parsed.data.type,
    value: Math.round(parsed.data.value),
    minSpend: Math.round(parsed.data.minSpend),
    usageLimit: parsed.data.usageLimit ?? null,
    active: parsed.data.active,
    expiresAt: parsed.data.expiresAt || null,
    description: parsed.data.description || "",
  });
  return NextResponse.json({ id }, { status: 201 });
}
