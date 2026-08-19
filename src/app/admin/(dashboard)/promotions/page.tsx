"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { formatRM } from "@/lib/money";
import { cn } from "@/lib/utils";

type Discount = {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_delivery";
  value: number;
  minSpend: number;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  description: string;
};

export default function AdminPromotionsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [code, setCode] = useState("");
  const [type, setType] = useState<Discount["type"]>("percentage");
  const [value, setValue] = useState("");
  const [minSpend, setMinSpend] = useState("0");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/discounts");
    const data = await res.json();
    setDiscounts(data.discounts || []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/discounts")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setDiscounts(data.discounts || []);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleActive(d: Discount) {
    await fetch(`/api/admin/discounts/${d.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !d.active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this promo code?")) return;
    await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
    load();
  }

  async function create() {
    setSaving(true);
    await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        type,
        value: type === "fixed" ? Math.round(parseFloat(value || "0") * 100) : parseFloat(value || "0"),
        minSpend: Math.round(parseFloat(minSpend || "0") * 100),
        active: true,
        description,
      }),
    });
    setCode("");
    setValue("");
    setDescription("");
    setSaving(false);
    setShowForm(false);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-jungle-950">Promotions</h1>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 rounded-full bg-jungle-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-jungle-700">
          <Plus size={16} /> New Discount Code
        </button>
      </div>

      {showForm && (
        <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6 mb-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-jungle-500 mb-1 block">Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="w-full rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm" placeholder="WELCOME10" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-jungle-500 mb-1 block">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as Discount["type"])} className="w-full rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm">
              <option value="percentage">Percentage off</option>
              <option value="fixed">Fixed amount off (RM)</option>
              <option value="free_delivery">Free delivery</option>
            </select>
          </div>
          {type !== "free_delivery" && (
            <div>
              <label className="text-xs font-bold uppercase text-jungle-500 mb-1 block">{type === "percentage" ? "Percentage (%)" : "Amount (RM)"}</label>
              <input value={value} onChange={(e) => setValue(e.target.value)} type="number" className="w-full rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm" />
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase text-jungle-500 mb-1 block">Minimum Spend (RM)</label>
            <input value={minSpend} onChange={(e) => setMinSpend(e.target.value)} type="number" className="w-full rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase text-jungle-500 mb-1 block">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm" />
          </div>
          <button
            onClick={create}
            disabled={saving || !code}
            className="sm:col-span-2 rounded-full bg-jungle-600 py-3 font-bold text-white hover:bg-jungle-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="animate-spin" size={16} />} Create
          </button>
        </div>
      )}

      {loading ? (
        <Loader2 className="animate-spin text-jungle-400" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {discounts.map((d) => (
            <div key={d.id} className="rounded-2xl bg-white card-shadow border border-jungle-50 p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-jungle-950 text-lg">{d.code}</span>
                <button onClick={() => toggleActive(d)} className={cn("rounded-full px-3 py-1 text-xs font-bold", d.active ? "bg-jungle-100 text-jungle-700" : "bg-tomato-100 text-tomato-700")}>
                  {d.active ? "Active" : "Disabled"}
                </button>
              </div>
              <p className="text-sm text-jungle-500 mt-1">{d.description}</p>
              <p className="text-sm mt-2 text-jungle-700">
                {d.type === "percentage" ? `${d.value}% off` : d.type === "fixed" ? `${formatRM(d.value)} off` : "Free delivery"}
                {d.minSpend > 0 && ` · min spend ${formatRM(d.minSpend)}`}
              </p>
              <p className="text-xs text-jungle-400 mt-1">
                Used {d.usedCount} time{d.usedCount === 1 ? "" : "s"}
                {d.usageLimit ? ` / ${d.usageLimit} limit` : ""}
              </p>
              <button onClick={() => remove(d.id)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-tomato-500 hover:underline">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
