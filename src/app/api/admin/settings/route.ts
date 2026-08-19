import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { businessSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getBusinessSettings } from "@/lib/settings";
import { getPaymentMode, isBillplzConfigured } from "@/lib/billplz";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const settings = await getBusinessSettings();
  return NextResponse.json({
    settings,
    // Payment mode/credential status is read from environment variables (never the DB)
    // so it can never be silently flipped to "live" from the UI without real keys.
    paymentModeEnv: getPaymentMode(),
    billplzConfigured: isBillplzConfigured(),
  });
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const body = await req.json().catch(() => ({}));

  await db
    .update(businessSettings)
    .set({
      cafeName: body.cafeName,
      address: body.address,
      phone: body.phone,
      email: body.email,
      whatsappNumber: body.whatsappNumber,
      operatingHoursJson: body.operatingHours ? JSON.stringify(body.operatingHours) : undefined,
      holidaysJson: body.holidays ? JSON.stringify(body.holidays) : undefined,
      pickupEnabled: typeof body.pickupEnabled === "boolean" ? body.pickupEnabled : undefined,
      deliveryEnabled: typeof body.deliveryEnabled === "boolean" ? body.deliveryEnabled : undefined,
      taxPercent: typeof body.taxPercent === "number" ? body.taxPercent : undefined,
      serviceChargePercent: typeof body.serviceChargePercent === "number" ? body.serviceChargePercent : undefined,
      mapEmbedUrl: body.mapEmbedUrl,
      mapDirectionsUrl: body.mapDirectionsUrl,
    })
    .where(eq(businessSettings.id, "main"));

  return NextResponse.json({ ok: true });
}
