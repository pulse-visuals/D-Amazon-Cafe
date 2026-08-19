"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function RetryPaymentButton({ orderNumber }: { orderNumber: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function retry() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to retry payment.");
        setLoading(false);
        return;
      }
      window.location.href = data.paymentUrl;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        onClick={retry}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-jungle-600 px-6 py-3 font-bold text-white hover:bg-jungle-700 disabled:opacity-70"
      >
        {loading && <Loader2 className="animate-spin" size={16} />}
        Retry Payment
      </button>
      {error && <p className="mt-2 text-sm text-tomato-600">{error}</p>}
    </div>
  );
}
