import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/menu";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getAllProducts();
  return NextResponse.json({ products });
}
