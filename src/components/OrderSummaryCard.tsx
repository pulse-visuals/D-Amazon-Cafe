import { formatRM } from "@/lib/money";
import type { OrderWithDetails } from "@/lib/get-order";

export function OrderSummaryCard({ order }: { order: OrderWithDetails }) {
  return (
    <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-jungle-950">Order Summary</h2>
        <span className="text-sm font-bold text-jungle-500">{order.orderNumber}</span>
      </div>

      <div className="mt-5 divide-y divide-jungle-50">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-semibold text-jungle-900">
                {item.quantity}× {item.productName} {item.variantName && <span className="text-jungle-400">({item.variantName})</span>}
              </p>
              {item.addOns.length > 0 && <p className="text-xs text-jungle-400">+ {item.addOns.map((a) => a.name).join(", ")}</p>}
              {item.specialInstructions && <p className="text-xs italic text-jungle-400">&ldquo;{item.specialInstructions}&rdquo;</p>}
            </div>
            <span className="shrink-0 text-sm font-bold text-jungle-700">{formatRM(item.lineTotal)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1.5 border-t border-jungle-100 pt-4 text-sm">
        <div className="flex justify-between text-jungle-500">
          <span>Subtotal</span>
          <span>{formatRM(order.subtotal)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-teal-600 font-semibold">
            <span>Discount {order.discountCode && `(${order.discountCode})`}</span>
            <span>-{formatRM(order.discountAmount)}</span>
          </div>
        )}
        {order.orderType === "delivery" && (
          <div className="flex justify-between text-jungle-500">
            <span>Delivery Fee {order.deliveryZoneName && `(${order.deliveryZoneName})`}</span>
            <span>{order.deliveryFee === 0 ? "FREE" : formatRM(order.deliveryFee)}</span>
          </div>
        )}
        {order.taxAmount > 0 && (
          <div className="flex justify-between text-jungle-500">
            <span>Tax / Service Charge</span>
            <span>{formatRM(order.taxAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-extrabold text-jungle-950 pt-2 border-t border-jungle-100 mt-2">
          <span>Total</span>
          <span>{formatRM(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
