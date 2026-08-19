import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { markOrderPaid, markOrderPaymentFailed } from "@/lib/order-service";
import { getPaymentMode } from "@/lib/billplz";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Backing endpoint for the DEMO PAYMENT MODE simulator screen only.
 * Refuses to run at all when PAYMENT_MODE=live, so a demo "payment" can never
 * be mistaken for — or substituted for — a real, gateway-confirmed payment.
 */
export async function POST(req: Request) {
  const limited = rateLimit(req, "demo-payment", 20, 60_000);
  if (limited) return limited;

  if (getPaymentMode() !== "demo") {
    return NextResponse.json({ error: "Demo payment confirmation is disabled while PAYMENT_MODE is live." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { orderNumber, outcome } = body as { orderNumber?: string; outcome?: "success" | "fail" };
  if (!orderNumber) return NextResponse.json({ error: "Missing orderNumber." }, { status: 400 });

  const order = await db.query.orders.findFirst({ where: eq(orders.orderNumber, orderNumber) });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.paymentMode !== "demo") {
    return NextResponse.json({ error: "This order was not created in demo payment mode." }, { status: 400 });
  }

  if (outcome === "fail") {
    await markOrderPaymentFailed({ orderId: order.id, rawPayload: { simulated: true, outcome: "fail" } });
    return NextResponse.json({ status: "failed" });
  }

  await markOrderPaid({ orderId: order.id, rawPayload: { simulated: true, outcome: "success" } });
  return NextResponse.json({ status: "paid" });
}
