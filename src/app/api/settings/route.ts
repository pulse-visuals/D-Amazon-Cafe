import { NextResponse } from "next/server";
import { getBusinessSettings } from "@/lib/settings";
import { getPaymentMode } from "@/lib/billplz";

export const dynamic = "force-dynamic";

// Public-safe subset of business settings for the storefront (no secrets).
export async function GET() {
  const settings = await getBusinessSettings();
  return NextResponse.json({ settings: { ...settings, paymentMode: getPaymentMode() } });
}
