import { NextResponse } from "next/server";
import { parseBillplzFields, verifyBillplzSignature } from "@/lib/billplz";
import { markOrderPaid, markOrderPaymentFailed } from "@/lib/order-service";

export const dynamic = "force-dynamic";

/**
 * Billplz posts this as application/x-www-form-urlencoded with fields like
 * billplz[id], billplz[paid], billplz[x_signature], etc. This is the ONLY
 * place an order is allowed to transition to PAID in live mode — never the
 * client-side redirect_url, which a user could reach without ever paying.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);
  const fields = parseBillplzFields(params);

  if (!verifyBillplzSignature(fields)) {
    console.error("Billplz webhook signature verification failed", fields.id);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const isPaid = fields.paid === "true";
  if (isPaid) {
    await markOrderPaid({ gatewayBillId: fields.id, rawPayload: fields });
  } else {
    await markOrderPaymentFailed({ gatewayBillId: fields.id, rawPayload: fields });
  }

  return NextResponse.json({ ok: true });
}
