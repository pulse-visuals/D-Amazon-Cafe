import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { retryPayment } from "@/lib/order-service";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limited = rateLimit(req, "payment-retry", 10, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const { orderNumber } = body as { orderNumber?: string };
  if (!orderNumber) return NextResponse.json({ error: "Missing orderNumber." }, { status: 400 });

  const order = await db.query.orders.findFirst({ where: eq(orders.orderNumber, orderNumber) });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  try {
    const bill = await retryPayment(order.id);
    return NextResponse.json({ paymentUrl: bill.paymentUrl });
  } catch (err) {
    console.error("Payment retry failed", err);
    return NextResponse.json({ error: "Unable to restart payment. Please try again." }, { status: 500 });
  }
}
