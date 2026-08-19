"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Printer, X, Loader2 } from "lucide-react";
import { formatRM } from "@/lib/money";
import { ORDER_STATUS_LABEL, ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  orderType: "pickup" | "delivery";
  customerName: string;
  customerPhone: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
};

const STATUS_TONE: Record<string, string> = {
  received: "bg-jungle-100 text-jungle-700",
  paid: "bg-teal-100 text-teal-700",
  preparing: "bg-amber-100 text-amber-700",
  ready: "bg-gold-100 text-gold-700",
  out_for_delivery: "bg-blue-100 text-blue-700",
  completed: "bg-jungle-600 text-white",
  cancelled: "bg-tomato-100 text-tomato-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setOrders(data.orders || []);
          setLoading(false);
        }
      });
    const interval = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-jungle-950">Orders</h1>
        {loading && <Loader2 className="animate-spin text-jungle-400" size={20} />}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
          All ({orders.length})
        </FilterPill>
        {ORDER_STATUSES.map((s) => (
          <FilterPill key={s} active={filter === s} onClick={() => setFilter(s)}>
            {ORDER_STATUS_LABEL[s]} ({orders.filter((o) => o.status === s).length})
          </FilterPill>
        ))}
      </div>

      <div className="rounded-3xl bg-white card-shadow border border-jungle-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-jungle-50 text-jungle-500 text-xs uppercase font-bold">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-jungle-50">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-jungle-50/50 cursor-pointer" onClick={() => setSelected(o.id)}>
                  <td className="px-4 py-3 font-bold text-jungle-900">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-jungle-600">{o.customerName}</td>
                  <td className="px-4 py-3 text-jungle-600 capitalize">{o.orderType}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", STATUS_TONE[o.status])}>{ORDER_STATUS_LABEL[o.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-bold uppercase", o.paymentStatus === "paid" ? "text-teal-600" : o.paymentStatus === "failed" ? "text-tomato-600" : "text-jungle-400")}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-jungle-900">{formatRM(o.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/receipt/${o.id}`} target="_blank" onClick={(e) => e.stopPropagation()} className="text-jungle-400 hover:text-jungle-700">
                      <Printer size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-jungle-400">
                    No orders in this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <OrderDetailDrawer orderId={selected} onClose={() => setSelected(null)} onUpdated={load} />}
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border-2 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap",
        active ? "border-jungle-600 bg-jungle-600 text-white" : "border-jungle-100 bg-white text-jungle-500"
      )}
    >
      {children}
    </button>
  );
}

type OrderDetail = OrderRow & {
  customerEmail: string;
  orderNotes: string;
  deliveryAddress1: string;
  deliveryAddress2: string;
  deliveryPostcode: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZoneName?: string;
  subtotal: number;
  discountAmount: number;
  discountCode: string;
  deliveryFee: number;
  taxAmount: number;
  items: { id: string; productName: string; variantName: string; quantity: number; lineTotal: number; addOns: { name: string; price: number }[]; specialInstructions: string }[];
};

function OrderDetailDrawer({ orderId, onClose, onUpdated }: { orderId: string; onClose: () => void; onUpdated: () => void }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [updating, setUpdating] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/orders/${orderId}`);
    const data = await res.json();
    setOrder(data.order);
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setOrder(data.order);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function changeStatus(status: OrderStatus) {
    setUpdating(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    onUpdated();
    setUpdating(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-jungle-950/50" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-white overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-extrabold text-jungle-950">{order?.orderNumber || "Loading..."}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-jungle-100">
            <X size={18} />
          </button>
        </div>

        {!order ? (
          <Loader2 className="animate-spin text-jungle-400" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl bg-jungle-50 p-3">
                <p className="text-[10px] font-bold uppercase text-jungle-400">Order Type</p>
                <p className="font-bold text-jungle-900 capitalize">{order.orderType}</p>
              </div>
              <div className="rounded-xl bg-jungle-50 p-3">
                <p className="text-[10px] font-bold uppercase text-jungle-400">Payment</p>
                <p className="font-bold text-jungle-900 capitalize">{order.paymentStatus}</p>
              </div>
            </div>

            <h3 className="font-bold text-jungle-900 text-sm mb-2">Update Status</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  disabled={updating}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-bold border-2 disabled:opacity-50",
                    order.status === s ? "bg-jungle-600 border-jungle-600 text-white" : "border-jungle-100 text-jungle-500 hover:border-jungle-300"
                  )}
                >
                  {ORDER_STATUS_LABEL[s]}
                </button>
              ))}
            </div>

            <h3 className="font-bold text-jungle-900 text-sm mb-2">Items</h3>
            <div className="space-y-2 mb-5">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm border-b border-jungle-50 pb-2">
                  <div>
                    <p className="font-semibold text-jungle-900">
                      {item.quantity}× {item.productName} {item.variantName && `(${item.variantName})`}
                    </p>
                    {item.addOns.length > 0 && <p className="text-xs text-jungle-400">+ {item.addOns.map((a) => a.name).join(", ")}</p>}
                    {item.specialInstructions && <p className="text-xs italic text-jungle-400">&ldquo;{item.specialInstructions}&rdquo;</p>}
                  </div>
                  <span className="font-bold text-jungle-700">{formatRM(item.lineTotal)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-sm mb-5">
              <div className="flex justify-between text-jungle-500">
                <span>Subtotal</span>
                <span>{formatRM(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-teal-600">
                  <span>Discount ({order.discountCode})</span>
                  <span>-{formatRM(order.discountAmount)}</span>
                </div>
              )}
              {order.orderType === "delivery" && (
                <div className="flex justify-between text-jungle-500">
                  <span>Delivery</span>
                  <span>{formatRM(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-jungle-950 pt-1 border-t border-jungle-100">
                <span>Total</span>
                <span>{formatRM(order.total)}</span>
              </div>
            </div>

            <h3 className="font-bold text-jungle-900 text-sm mb-2">Customer</h3>
            <div className="rounded-xl bg-jungle-50 p-4 text-sm text-jungle-600 space-y-1 mb-5">
              <p>{order.customerName}</p>
              <p>{order.customerPhone}</p>
              {order.customerEmail && <p>{order.customerEmail}</p>}
              {order.orderType === "delivery" && (
                <p>
                  {order.deliveryAddress1}, {order.deliveryAddress2 && `${order.deliveryAddress2}, `}
                  {order.deliveryPostcode} {order.deliveryCity}, {order.deliveryState}
                </p>
              )}
              {order.orderNotes && <p className="italic">Note: {order.orderNotes}</p>}
            </div>

            <Link href={`/receipt/${order.id}`} target="_blank" className="inline-flex items-center gap-2 rounded-full bg-jungle-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-jungle-700">
              <Printer size={15} /> Print Receipt
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
