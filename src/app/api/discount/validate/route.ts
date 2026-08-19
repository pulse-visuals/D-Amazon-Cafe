import { NextResponse } from "next/server";
import { applyDiscountCode } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Convenience preview only — the authoritative discount check happens again
// server-side during POST /api/orders, so a spoofed preview cannot change
// what a customer is actually charged.
export async function POST(req: Request) {
  const limited = rateLimit(req, "discount", 20, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code : "";
  const subtotal = typeof body.subtotal === "number" ? body.subtotal : 0;

  const result = await applyDiscountCode(code, subtotal);
  return NextResponse.json(result);
}
