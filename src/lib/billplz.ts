/**
 * Billplz payment gateway adapter.
 *
 * Two modes, controlled by the PAYMENT_MODE env var (see .env.example):
 *   - "demo": no real gateway is contacted. Checkout is routed to an in-app
 *     DEMO PAYMENT MODE simulator (/payment/demo) that is clearly labeled as
 *     a simulation. No card/bank data is collected. Orders are only marked
 *     PAID after the customer explicitly confirms on that demo screen — this
 *     mirrors a real redirect+webhook flow so the rest of the app (order
 *     status, receipts, admin) behaves identically once a real gateway is
 *     plugged in.
 *   - "live": real calls to the Billplz REST API. Requires BILLPLZ_API_KEY,
 *     BILLPLZ_COLLECTION_ID, BILLPLZ_X_SIGNATURE_KEY and BILLPLZ_BASE_URL.
 *     Orders only become PAID when Billplz's webhook (/api/payments/billplz/webhook)
 *     posts a signature-verified "paid" callback — never from the client-side
 *     redirect alone, which can be spoofed or interrupted.
 *
 * X-Signature verification is implemented per Billplz's documented algorithm:
 * https://support.billplz.com/api — concatenate each of the fields below as
 * `key` + `value` (no separator), joined with "|", then HMAC-SHA256 with the
 * X Signature Key from the Billplz dashboard, and compare hex digests.
 */

import crypto from "crypto";

export type PaymentMode = "demo" | "live";

export function getPaymentMode(): PaymentMode {
  const mode = process.env.PAYMENT_MODE?.toLowerCase();
  return mode === "live" ? "live" : "demo";
}

export function isBillplzConfigured(): boolean {
  return !!(process.env.BILLPLZ_API_KEY && process.env.BILLPLZ_COLLECTION_ID && process.env.BILLPLZ_X_SIGNATURE_KEY);
}

export type CreateBillParams = {
  orderId: string;
  orderNumber: string;
  amountSen: number;
  name: string;
  email: string;
  mobile?: string;
  description: string;
};

export type CreateBillResult = {
  billId: string;
  paymentUrl: string;
};

const BILLPLZ_WEBHOOK_FIELDS = [
  "amount",
  "collection_id",
  "due_at",
  "email",
  "id",
  "mobile",
  "name",
  "paid_amount",
  "paid_at",
  "paid",
  "state",
  "url",
] as const;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/**
 * Creates a payment bill. In demo mode this never touches the network — it
 * mints a local demo bill id and points the customer at our own simulator.
 */
export async function createBill(params: CreateBillParams): Promise<CreateBillResult> {
  const mode = getPaymentMode();

  if (mode === "demo") {
    return {
      billId: `demo_${params.orderId}`,
      paymentUrl: `${siteUrl()}/payment/demo?order=${encodeURIComponent(params.orderNumber)}`,
    };
  }

  if (!isBillplzConfigured()) {
    throw new Error(
      "PAYMENT_MODE is 'live' but Billplz is not configured. Set BILLPLZ_API_KEY, BILLPLZ_COLLECTION_ID and BILLPLZ_X_SIGNATURE_KEY in your environment."
    );
  }

  const base = process.env.BILLPLZ_BASE_URL || "https://www.billplz-sandbox.com/api/v3";
  const apiKey = process.env.BILLPLZ_API_KEY!;
  const auth = Buffer.from(`${apiKey}:`).toString("base64");

  const body = new URLSearchParams({
    collection_id: process.env.BILLPLZ_COLLECTION_ID!,
    email: params.email || "guest@damazoncafe.my",
    mobile: params.mobile || "",
    name: params.name,
    amount: String(params.amountSen),
    description: params.description.slice(0, 200),
    callback_url: `${siteUrl()}/api/payments/billplz/webhook`,
    redirect_url: `${siteUrl()}/order-confirmation/${params.orderNumber}`,
    reference_1_label: "Order",
    reference_1: params.orderNumber,
  });

  const res = await fetch(`${base}/bills`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Billplz create bill failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { id: string; url: string };
  return { billId: json.id, paymentUrl: json.url };
}

/**
 * Verifies an inbound Billplz webhook/redirect payload's X-Signature.
 * `fields` should be the flat billplz[...] values already stripped of the
 * "billplz[]" wrapper, e.g. { id, paid, paid_amount, x_signature, ... }.
 */
export function verifyBillplzSignature(fields: Record<string, string>): boolean {
  if (!process.env.BILLPLZ_X_SIGNATURE_KEY) return false;
  const signature = fields.x_signature;
  if (!signature) return false;

  const sourceString = BILLPLZ_WEBHOOK_FIELDS.map((key) => `${key}${fields[key] ?? ""}`).join("|");

  const computed = crypto
    .createHmac("sha256", process.env.BILLPLZ_X_SIGNATURE_KEY)
    .update(sourceString)
    .digest("hex");

  // Constant-time comparison
  const a = Buffer.from(computed);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Parses the `billplz[key]=value` form fields Billplz posts into a flat object. */
export function parseBillplzFields(formData: URLSearchParams | Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  const entries: [string, string][] =
    formData instanceof URLSearchParams ? Array.from(formData.entries()) : Object.entries(formData);
  for (const [key, value] of entries) {
    const match = key.match(/^billplz\[(.+)\]$/);
    out[match ? match[1] : key] = value;
  }
  return out;
}
