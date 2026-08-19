"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl mb-4">🌿</p>
      <h1 className="font-display text-3xl font-extrabold text-jungle-950">Something went wrong</h1>
      <p className="mt-3 text-jungle-500 max-w-sm">We hit a snag loading this page. Please try again, or head back home.</p>
      <div className="mt-7 flex gap-3">
        <button onClick={reset} className="rounded-full bg-jungle-600 px-6 py-3 font-bold text-white hover:bg-jungle-700">
          Try Again
        </button>
        <Link href="/" className="rounded-full border-2 border-jungle-200 px-6 py-3 font-bold text-jungle-700 hover:border-jungle-400">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
