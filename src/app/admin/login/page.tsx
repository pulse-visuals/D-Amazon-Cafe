"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Logo } from "@/components/Logo";

function AdminLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = useState("admin@damazoncafe.my");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-jungle-950 to-jungle-800 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 card-shadow">
        <div className="flex justify-center mb-6">
          <Logo size={56} withText={false} href={null} />
        </div>
        <h1 className="text-center font-display text-xl font-extrabold text-jungle-950">D&apos;Amazon Cafe Admin</h1>
        <p className="text-center text-sm text-jungle-400 mt-1 mb-6">Sign in to manage your cafe</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-jungle-500 mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border-2 border-jungle-100 px-3.5 py-2.5 text-sm focus:border-jungle-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-jungle-500 mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border-2 border-jungle-100 px-3.5 py-2.5 text-sm focus:border-jungle-400 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm font-semibold text-tomato-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-jungle-600 py-3 font-bold text-white hover:bg-jungle-700 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
            Sign In
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-jungle-400">
          Default demo login: admin@damazoncafe.my — see your .env.local for the seeded password.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginInner />
    </Suspense>
  );
}
