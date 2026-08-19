import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Logo size={72} withText={false} href={null} />
      <h1 className="mt-6 font-display text-4xl font-extrabold text-jungle-950">Lost in the Jungle?</h1>
      <p className="mt-3 text-jungle-500 max-w-sm">We couldn&apos;t find that page. Let&apos;s get you back to something delicious.</p>
      <div className="mt-7 flex gap-3">
        <Link href="/" className="rounded-full bg-jungle-600 px-6 py-3 font-bold text-white hover:bg-jungle-700">
          Back to Home
        </Link>
        <Link href="/menu" className="rounded-full border-2 border-jungle-200 px-6 py-3 font-bold text-jungle-700 hover:border-jungle-400">
          View Menu
        </Link>
      </div>
    </div>
  );
}
