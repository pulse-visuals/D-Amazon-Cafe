"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 rounded-full bg-jungle-600 px-6 py-3 font-bold text-white hover:bg-jungle-700"
    >
      <Printer size={16} /> Print Receipt
    </button>
  );
}
