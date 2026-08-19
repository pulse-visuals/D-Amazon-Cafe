import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Minimal, low-PII lookup by order number — used by the demo payment simulator
// and payment retry flows, which only need to know the amount/status, not the
// full order (that requires the internal id — see /api/orders/[id]).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");
  if (!orderNumber) return NextResponse.json({ error: "Missing orderNumber." }, { status: 400 });

  const order = await db.query.orders.findFirst({ where: eq(orders.orderNumber, orderNumber) });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    total: order.total,
    paymentStatus: order.paymentStatus,
    paymentMode: order.paymentMode,
    customerName: order.customerName,
  });
}
