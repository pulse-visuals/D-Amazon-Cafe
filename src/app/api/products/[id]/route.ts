import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/menu";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await getAllProducts();
  const product = products.find((p) => p.id === id || p.slug === id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}
