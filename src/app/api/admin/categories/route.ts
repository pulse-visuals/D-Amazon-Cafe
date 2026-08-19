import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { newId } from "@/lib/id";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const rows = await db.query.categories.findMany({ orderBy: asc(categories.sortOrder) });
  return NextResponse.json({ categories: rows });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const body = await req.json().catch(() => ({}));
  const { slug, name, description, icon } = body;
  if (!slug || !name) return NextResponse.json({ error: "Slug and name are required." }, { status: 400 });

  const id = newId("cat");
  await db.insert(categories).values({ id, slug, name, description: description || "", icon: icon || "🍽️", sortOrder: 999 });
  return NextResponse.json({ id }, { status: 201 });
}
