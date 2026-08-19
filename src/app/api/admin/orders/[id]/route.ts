import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getOrderWithDetails } from "@/lib/get-order";
import { updateOrderStatus } from "@/lib/order-service";
import { ORDER_STATUSES } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;
  const order = await getOrderWithDetails(id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status, note } = body as { status?: string; note?: string };

  if (!status || !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  await updateOrderStatus(id, status as (typeof ORDER_STATUSES)[number], note || `Status updated by ${guard.session.name}.`);
  return NextResponse.json({ ok: true });
}
