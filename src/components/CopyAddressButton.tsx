"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyAddressButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fail silently, the address is still visible on screen.
    }
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full border-2 border-jungle-200 px-5 py-3 font-bold text-jungle-700 hover:border-jungle-400 transition-colors"
    >
      {copied ? <Check size={16} className="text-teal-600" /> : <Copy size={16} />}
      {copied ? "Copied!" : "Copy Address"}
    </button>
  );
}
