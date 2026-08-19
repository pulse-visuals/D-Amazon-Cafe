import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { addOns } from "@/lib/db/schema";
import { newId } from "@/lib/id";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const rows = await db.query.addOns.findMany();
  return NextResponse.json({ addOns: rows });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const body = await req.json().catch(() => ({}));
  const { name, price } = body;
  if (!name || typeof price !== "number") return NextResponse.json({ error: "Name and price are required." }, { status: 400 });
  const id = newId("addon");
  await db.insert(addOns).values({ id, name, price: Math.round(price), active: true });
  return NextResponse.json({ id }, { status: 201 });
}
