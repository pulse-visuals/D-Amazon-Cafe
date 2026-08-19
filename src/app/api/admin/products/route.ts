import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getAllProducts } from "@/lib/menu";
import { productSchema } from "@/lib/validators";
import { createProduct } from "@/lib/admin-products";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const products = await getAllProducts();
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => ({}));
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid product data.", details: parsed.error.flatten() }, { status: 400 });

  const id = await createProduct(parsed.data);
  return NextResponse.json({ id }, { status: 201 });
}
