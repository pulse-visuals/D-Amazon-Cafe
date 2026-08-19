import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { productSchema } from "@/lib/validators";
import { updateProduct, deleteProduct, setProductAvailability } from "@/lib/admin-products";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid product data.", details: parsed.error.flatten() }, { status: 400 });

  await updateProduct(id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  await setProductAvailability(id, {
    isAvailable: typeof body.isAvailable === "boolean" ? body.isAvailable : undefined,
    isSoldOut: typeof body.isSoldOut === "boolean" ? body.isSoldOut : undefined,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
