import Image from "next/image";
import { notFound } from "next/navigation";
import { getOrderWithDetails } from "@/lib/get-order";
import { getBusinessSettings } from "@/lib/settings";
import { formatRM } from "@/lib/money";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([getOrderWithDetails(id), getBusinessSettings()]);
  if (!order) notFound();

  const createdAt = new Date(order.createdAt);

  return (
    <div className="mx-auto max-w-xl px-4 py-10 print:py-0">
      <div className="mb-6 text-center print:hidden">
        <PrintButton />
      </div>

      <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-8 print:rounded-none print:shadow-none print:border-0">
        <div className="flex flex-col items-center text-center">
          <Image src="/images/logo.png" alt="D'Amazon Cafe logo" width={64} height={64} />
          <h1 className="mt-2 font-display text-xl font-extrabold text-jungle-950">{settings.cafeName}</h1>
          <p className="mt-1 text-xs text-jungle-500 max-w-xs">{settings.address}</p>
        </div>

        <div className="mt-6 border-t border-dashed border-jungle-200 pt-4 text-sm space-y-1 text-jungle-600">
          <div className="flex justify-between">
            <span>Order Number</span>
            <span className="font-bold text-jungle-950">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date</span>
            <span>{createdAt.toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer</span>
            <span>{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span>Order Type</span>
            <span className="capitalize">{order.orderType}</span>
          </div>
        </div>

        <div className="mt-4 border-t border-dashed border-jungle-200 pt-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-1.5 text-sm">
              <span className="text-jungle-700">
                {item.quantity}× {item.productName} {item.variantName && `(${item.variantName})`}
                {item.addOns.length > 0 && (
                  <span className="block text-xs text-jungle-400">+ {item.addOns.map((a) => a.name).join(", ")}</span>
                )}
              </span>
              <span className="font-semibold text-jungle-900 shrink-0 pl-2">{formatRM(item.lineTotal)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-dashed border-jungle-200 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-jungle-600">
            <span>Subtotal</span>
            <span>{formatRM(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-jungle-600">
              <span>Discount</span>
              <span>-{formatRM(order.discountAmount)}</span>
            </div>
          )}
          {order.orderType === "delivery" && (
            <div className="flex justify-between text-jungle-600">
              <span>Delivery Fee</span>
              <span>{order.deliveryFee === 0 ? "FREE" : formatRM(order.deliveryFee)}</span>
            </div>
          )}
          {order.taxAmount > 0 && (
            <div className="flex justify-between text-jungle-600">
              <span>Tax / Service</span>
              <span>{formatRM(order.taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-jungle-950 border-t border-dashed border-jungle-200 pt-2 mt-2">
            <span>Total</span>
            <span>{formatRM(order.total)}</span>
          </div>
        </div>

        <div className="mt-4 border-t border-dashed border-jungle-200 pt-4 text-sm text-jungle-600 space-y-1">
          <div className="flex justify-between">
            <span>Payment Method</span>
            <span className="capitalize">{order.paymentMethod} ({order.paymentMode})</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status</span>
            <span className="font-bold uppercase">{order.paymentStatus}</span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-jungle-400">Thank you for ordering from D&apos;Amazon Cafe 🌿</p>
      </div>
    </div>
  );
}
