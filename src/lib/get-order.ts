import { db } from "./db";
import { orders, orderItems, orderStatusHistory, deliveryZones } from "./db/schema";
import { eq, asc } from "drizzle-orm";

export async function getOrderWithDetails(id: string) {
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order) return null;

  const [items, history] = await Promise.all([
    db.query.orderItems.findMany({ where: eq(orderItems.orderId, order.id) }),
    db.query.orderStatusHistory.findMany({ where: eq(orderStatusHistory.orderId, order.id), orderBy: asc(orderStatusHistory.createdAt) }),
  ]);

  let deliveryZoneName = "";
  if (order.deliveryZoneId) {
    const zone = await db.query.deliveryZones.findFirst({ where: eq(deliveryZones.id, order.deliveryZoneId) });
    deliveryZoneName = zone?.name || "";
  }

  return {
    ...order,
    deliveryZoneName,
    items: items.map((i) => ({ ...i, addOns: JSON.parse(i.addOnsJson) as { id: string; name: string; price: number }[] })),
    history,
  };
}

export type OrderWithDetails = NonNullable<Awaited<ReturnType<typeof getOrderWithDetails>>>;
