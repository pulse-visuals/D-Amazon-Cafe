import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle, Printer } from "lucide-react";
import { getOrderWithDetails } from "@/lib/get-order";
import { getBusinessSettings } from "@/lib/settings";
import { OrderSummaryCard } from "@/components/OrderSummaryCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { formatRM } from "@/lib/money";
import { RetryPaymentButton } from "./RetryPaymentButton";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { id } = await params;
  const { payment } = await searchParams;
  const [order, settings] = await Promise.all([getOrderWithDetails(id), getBusinessSettings()]);
  if (!order) notFound();

  const paymentFailed = payment === "failed" || order.paymentStatus === "failed";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
      {paymentFailed ? (
        <div className="text-center mb-8">
          <XCircle className="mx-auto text-tomato-500" size={56} />
          <h1 className="mt-4 font-display text-3xl font-extrabold text-jungle-950">Payment Unsuccessful</h1>
          <p className="mt-2 text-jungle-500">Payment unsuccessful. Please try again.</p>
          <RetryPaymentButton orderNumber={order.orderNumber} />
        </div>
      ) : (
        <div className="text-center mb-8">
          <CheckCircle2 className="mx-auto text-jungle-600" size={56} />
          <h1 className="mt-4 font-display text-3xl font-extrabold text-jungle-950">🎉 Order Confirmed!</h1>
          <p className="mt-2 text-jungle-500">Thank you for ordering from D&apos;Amazon Cafe.</p>
          <p className="mt-1 font-bold text-jungle-700">Order Number: {order.orderNumber}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <InfoTile label="Payment Status" value={order.paymentStatus.toUpperCase()} tone={order.paymentStatus === "paid" ? "good" : order.paymentStatus === "failed" ? "bad" : "neutral"} />
        <InfoTile label={order.orderType === "pickup" ? "Pickup" : "Delivery"} value={order.orderType === "pickup" ? "Self Pickup" : "Home Delivery"} />
        <InfoTile label="Est. Preparation Time" value="20–30 minutes" />
      </div>

      <OrderSummaryCard order={order} />

      <div className="mt-6 rounded-3xl bg-jungle-50 border border-jungle-100 p-6">
        <h3 className="font-display font-bold text-jungle-950 mb-2">Customer Information</h3>
        <p className="text-sm text-jungle-600">{order.customerName}</p>
        <p className="text-sm text-jungle-600">{order.customerPhone}</p>
        {order.customerEmail && <p className="text-sm text-jungle-600">{order.customerEmail}</p>}
        {order.orderType === "delivery" && (
          <p className="text-sm text-jungle-600 mt-2">
            {order.deliveryAddress1}, {order.deliveryAddress2 && `${order.deliveryAddress2}, `}
            {order.deliveryPostcode} {order.deliveryCity}, {order.deliveryState}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link href={`/track/${order.id}`} className="flex-1 rounded-full bg-jungle-600 py-3.5 text-center font-bold text-white hover:bg-jungle-700">
          TRACK MY ORDER
        </Link>
        <Link href="/menu" className="flex-1 rounded-full border-2 border-jungle-200 py-3.5 text-center font-bold text-jungle-700 hover:border-jungle-400">
          ORDER AGAIN
        </Link>
        <Link href="/" className="flex-1 rounded-full border-2 border-jungle-200 py-3.5 text-center font-bold text-jungle-700 hover:border-jungle-400">
          BACK TO HOME
        </Link>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <Link
          href={`/receipt/${order.id}`}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-jungle-200 py-3 text-sm font-bold text-jungle-700 hover:border-jungle-400"
        >
          <Printer size={16} /> View / Print Receipt
        </Link>
        {settings.whatsappNumber && (
          <WhatsAppButton
            number={settings.whatsappNumber}
            message={`Hi D'Amazon Cafe! I'd like to ask about my order ${order.orderNumber} (${formatRM(order.total)}).`}
            className="flex-1"
          />
        )}
      </div>
    </div>
  );
}

function InfoTile({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "good" | "bad" | "neutral" }) {
  return (
    <div className="rounded-2xl bg-white border border-jungle-100 p-4 text-center">
      <p className="text-[11px] font-bold uppercase tracking-wide text-jungle-400">{label}</p>
      <p className={`mt-1 font-extrabold ${tone === "good" ? "text-jungle-600" : tone === "bad" ? "text-tomato-600" : "text-jungle-900"}`}>{value}</p>
    </div>
  );
}
