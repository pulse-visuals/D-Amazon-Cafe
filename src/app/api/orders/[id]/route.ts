import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory, deliveryZones } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Public order lookup, keyed by the order's internal (long, random) id rather
 * than its human-readable order number — this keeps the sequential DAM-YYYY-####
 * numbers pleasant to read on receipts while making the tracking/confirmation
 * URL hard to guess or enumerate.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const [items, history] = await Promise.all([
    db.query.orderItems.findMany({ where: eq(orderItems.orderId, order.id) }),
    db.query.orderStatusHistory.findMany({ where: eq(orderStatusHistory.orderId, order.id), orderBy: asc(orderStatusHistory.createdAt) }),
  ]);

  let zoneName = "";
  if (order.deliveryZoneId) {
    const zone = await db.query.deliveryZones.findFirst({ where: eq(deliveryZones.id, order.deliveryZoneId) });
    zoneName = zone?.name || "";
  }

  return NextResponse.json({
    order: { ...order, items: items.map((i) => ({ ...i, addOns: JSON.parse(i.addOnsJson) })), history, deliveryZoneName: zoneName },
  });
}
