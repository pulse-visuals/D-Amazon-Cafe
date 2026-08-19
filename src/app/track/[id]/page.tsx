"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { OrderTracker } from "@/components/OrderTracker";
import { formatRM } from "@/lib/money";
import type { OrderStatus } from "@/lib/order-status";
import { PageHeader } from "@/components/PageHeader";

type TrackOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  orderType: "pickup" | "delivery";
  total: number;
  paymentStatus: string;
  customerName: string;
};

export default function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [order, setOrder] = useState<TrackOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order not found.");
        return;
      }
      setOrder(data.order);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <PageHeader eyebrow="Live Status" title="Track My Order" compact />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-jungle-400" size={32} />
          </div>
        ) : error || !order ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-jungle-700">{error}</p>
            <Link href="/" className="mt-4 inline-block text-jungle-600 font-bold hover:underline">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6 sm:p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-jungle-400">Order</p>
                <p className="font-display text-xl font-extrabold text-jungle-950">{order.orderNumber}</p>
              </div>
              <button onClick={load} aria-label="Refresh status" className="rounded-full bg-jungle-100 p-2.5 hover:bg-jungle-200 transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>

            <OrderTracker status={order.status} orderType={order.orderType} />

            <div className="mt-10 flex items-center justify-between rounded-2xl bg-jungle-50 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-jungle-400">Total</p>
                <p className="font-extrabold text-jungle-950 text-lg">{formatRM(order.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-jungle-400">Payment</p>
                <p className="font-extrabold text-jungle-950 text-lg capitalize">{order.paymentStatus}</p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-jungle-400">This page refreshes automatically every 15 seconds.</p>
          </div>
        )}
      </div>
    </>
  );
}
