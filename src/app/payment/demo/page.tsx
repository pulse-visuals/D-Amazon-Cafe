"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ShieldAlert, CreditCard, Smartphone, Building2 } from "lucide-react";
import { formatRM } from "@/lib/money";
import { Logo } from "@/components/Logo";

type LookupResult = {
  id: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  paymentMode: string;
  customerName: string;
};

function DemoPaymentInner() {
  const router = useRouter();
  const params = useSearchParams();
  const orderNumber = params.get("order") || "";
  const [order, setOrder] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<"success" | "fail" | null>(null);
  const [method, setMethod] = useState<"card" | "fpx" | "ewallet">("fpx");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderNumber) return;
    fetch(`/api/orders/lookup?orderNumber=${encodeURIComponent(orderNumber)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data);
      })
      .finally(() => setLoading(false));
  }, [orderNumber]);

  async function confirm(outcome: "success" | "fail") {
    setProcessing(outcome);
    try {
      const res = await fetch("/api/payments/demo/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, outcome }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setProcessing(null);
        return;
      }
      // Simulate gateway processing delay for a realistic feel.
      setTimeout(() => {
        router.push(`/order-confirmation/${order?.id}${outcome === "fail" ? "?payment=failed" : ""}`);
      }, 900);
    } catch {
      setError("Network error. Please try again.");
      setProcessing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-jungle-400" size={32} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="font-semibold text-jungle-700">{error || "Order not found."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <div className="text-center mb-6">
        <span className="inline-block rounded-full bg-gold-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-gold-700 border-2 border-gold-300">
          🧪 Demo Payment Mode — No Real Money Involved
        </span>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <Logo size={36} textClassName="text-jungle-950" />
          <span className="text-xs font-bold text-jungle-400">Simulated Gateway</span>
        </div>

        <div className="mt-6 rounded-2xl bg-jungle-50 p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-jungle-400">Amount Due</p>
          <p className="mt-1 font-display text-4xl font-extrabold text-jungle-950">{formatRM(order.total)}</p>
          <p className="mt-1 text-sm text-jungle-500">Order {order.orderNumber}</p>
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wide text-jungle-500 mb-2">Choose a payment method (simulated)</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "fpx", label: "FPX", icon: Building2 },
              { key: "card", label: "Card", icon: CreditCard },
              { key: "ewallet", label: "eWallet", icon: Smartphone },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key as typeof method)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-xs font-semibold transition-colors ${
                  method === m.key ? "border-jungle-600 bg-jungle-50 text-jungle-800" : "border-jungle-100 text-jungle-500"
                }`}
              >
                <m.icon size={20} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>
            This screen never collects real card, bank or wallet credentials. It exists to demonstrate the full order flow. To
            accept real payments, set <code className="font-mono">PAYMENT_MODE=live</code> with real Billplz credentials.
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => confirm("success")}
            disabled={!!processing}
            className="rounded-full bg-jungle-600 py-3.5 font-bold text-white hover:bg-jungle-700 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {processing === "success" && <Loader2 className="animate-spin" size={16} />}
            Simulate Successful Payment
          </button>
          <button
            onClick={() => confirm("fail")}
            disabled={!!processing}
            className="rounded-full border-2 border-tomato-300 py-3 font-bold text-tomato-600 hover:bg-tomato-50 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {processing === "fail" && <Loader2 className="animate-spin" size={16} />}
            Simulate Failed Payment
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function DemoPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <DemoPaymentInner />
    </Suspense>
  );
}
