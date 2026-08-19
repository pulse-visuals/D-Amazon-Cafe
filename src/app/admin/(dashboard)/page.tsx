"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, ClipboardList, Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { StatCounter } from "@/components/StatCounter";
import { formatRM } from "@/lib/money";

type Stats = {
  todayOrders: number;
  todaySales: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalOrders: number;
  totalSales: number;
  popularProducts: { name: string; qty: number }[];
  salesLast7Days: { day: string; sales: number; orders: number }[];
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <p className="text-jungle-400">Loading dashboard...</p>;

  const maxSales = Math.max(1, ...stats.salesLast7Days.map((d) => d.sales));

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-jungle-950 mb-6">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Today's Sales" value={<StatCounter value={stats.todaySales / 100} prefix="RM" decimals={2} />} tone="gold" />
        <StatCard icon={ClipboardList} label="Today's Orders" value={<StatCounter value={stats.todayOrders} />} tone="jungle" />
        <StatCard icon={Clock} label="Pending Orders" value={<StatCounter value={stats.pendingOrders} />} tone="amber" />
        <StatCard icon={CheckCircle2} label="Completed" value={<StatCounter value={stats.completedOrders} />} tone="teal" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-white card-shadow border border-jungle-50 p-6">
          <h2 className="font-display font-bold text-jungle-950 mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Sales — Last 7 Days
          </h2>
          {stats.salesLast7Days.length === 0 ? (
            <p className="text-sm text-jungle-400">No paid orders yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {stats.salesLast7Days.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-jungle-600 to-jungle-400 transition-all"
                      style={{ height: `${Math.max(4, (d.sales / maxSales) * 100)}%` }}
                      title={formatRM(d.sales)}
                    />
                  </div>
                  <span className="text-[10px] text-jungle-400">{d.day.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6">
          <h2 className="font-display font-bold text-jungle-950 mb-4">Popular Products</h2>
          {stats.popularProducts.length === 0 ? (
            <p className="text-sm text-jungle-400">No orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.popularProducts.map((p, i) => (
                <li key={p.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-jungle-100 text-jungle-600 text-xs font-bold">{i + 1}</span>
                    <span className="text-jungle-700 truncate max-w-[140px]">{p.name}</span>
                  </span>
                  <span className="font-bold text-jungle-950">{p.qty}×</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <StatCard icon={XCircle} label="Cancelled Orders" value={<StatCounter value={stats.cancelledOrders} />} tone="red" small />
        <StatCard icon={ClipboardList} label="All-Time Orders" value={<StatCounter value={stats.totalOrders} />} tone="jungle" small />
        <StatCard icon={DollarSign} label="All-Time Sales" value={<StatCounter value={stats.totalSales / 100} prefix="RM" decimals={2} />} tone="gold" small />
      </div>

      <div className="mt-6">
        <Link href="/admin/orders" className="text-jungle-600 font-bold hover:underline text-sm">
          Manage Orders →
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  small,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  tone: "gold" | "jungle" | "amber" | "teal" | "red";
  small?: boolean;
}) {
  const toneClasses: Record<string, string> = {
    gold: "bg-gold-50 text-gold-600",
    jungle: "bg-jungle-50 text-jungle-600",
    amber: "bg-amber-50 text-amber-600",
    teal: "bg-teal-50 text-teal-600",
    red: "bg-tomato-50 text-tomato-600",
  };
  return (
    <div className="rounded-2xl bg-white card-shadow border border-jungle-50 p-5 flex items-center gap-4">
      <div className={`rounded-xl p-3 ${toneClasses[tone]}`}>
        <Icon size={small ? 18 : 22} />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-jungle-400">{label}</p>
        <p className={`font-extrabold text-jungle-950 ${small ? "text-lg" : "text-2xl"}`}>{value}</p>
      </div>
    </div>
  );
}
