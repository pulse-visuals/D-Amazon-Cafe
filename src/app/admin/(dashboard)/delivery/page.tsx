"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { formatRM } from "@/lib/money";
import { cn } from "@/lib/utils";

type Zone = {
  id: string;
  name: string;
  areaDescription: string;
  fee: number;
  minOrder: number;
  freeDeliveryThreshold: number | null;
  active: boolean;
};

export default function AdminDeliveryPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/delivery-zones");
    const data = await res.json();
    setZones(data.zones || []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/delivery-zones")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setZones(data.zones || []);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateZone(id: string, patch: Partial<Zone>) {
    await fetch(`/api/admin/delivery-zones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this delivery zone?")) return;
    await fetch(`/api/admin/delivery-zones/${id}`, { method: "DELETE" });
    load();
  }

  async function addZone() {
    await fetch("/api/admin/delivery-zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Zone", areaDescription: "", fee: 500, minOrder: 0, active: true }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-jungle-950">Delivery Zones</h1>
        <button onClick={addZone} className="inline-flex items-center gap-2 rounded-full bg-jungle-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-jungle-700">
          <Plus size={16} /> Add Zone
        </button>
      </div>

      {loading ? (
        <Loader2 className="animate-spin text-jungle-400" />
      ) : (
        <div className="space-y-4">
          {zones.map((z) => (
            <div key={z.id} className="rounded-2xl bg-white card-shadow border border-jungle-50 p-5 grid sm:grid-cols-6 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-jungle-400">Name</label>
                <input defaultValue={z.name} onBlur={(e) => updateZone(z.id, { name: e.target.value })} className="w-full rounded-lg border border-jungle-100 px-2.5 py-1.5 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-jungle-400">Area Description</label>
                <input
                  defaultValue={z.areaDescription}
                  onBlur={(e) => updateZone(z.id, { areaDescription: e.target.value })}
                  className="w-full rounded-lg border border-jungle-100 px-2.5 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-jungle-400">Fee (RM)</label>
                <input
                  type="number"
                  step="0.5"
                  defaultValue={(z.fee / 100).toFixed(2)}
                  onBlur={(e) => updateZone(z.id, { fee: Math.round(parseFloat(e.target.value) * 100) })}
                  className="w-full rounded-lg border border-jungle-100 px-2.5 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-jungle-400">Min Order (RM)</label>
                <input
                  type="number"
                  step="0.5"
                  defaultValue={(z.minOrder / 100).toFixed(2)}
                  onBlur={(e) => updateZone(z.id, { minOrder: Math.round(parseFloat(e.target.value) * 100) })}
                  className="w-full rounded-lg border border-jungle-100 px-2.5 py-1.5 text-sm"
                />
              </div>
              <div className="sm:col-span-6 grid sm:grid-cols-6 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-jungle-400">Free Delivery Above (RM, blank = never)</label>
                  <input
                    type="number"
                    step="1"
                    defaultValue={z.freeDeliveryThreshold != null ? (z.freeDeliveryThreshold / 100).toFixed(2) : ""}
                    onBlur={(e) => updateZone(z.id, { freeDeliveryThreshold: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                    className="w-full rounded-lg border border-jungle-100 px-2.5 py-1.5 text-sm"
                  />
                </div>
                <button
                  onClick={() => updateZone(z.id, { active: !z.active })}
                  className={cn("rounded-full px-3 py-1.5 text-xs font-bold", z.active ? "bg-jungle-100 text-jungle-700" : "bg-tomato-100 text-tomato-700")}
                >
                  {z.active ? "Active" : "Disabled"}
                </button>
                <p className="text-xs text-jungle-400">Current fee: {formatRM(z.fee)}</p>
                <button onClick={() => remove(z.id)} className="inline-flex items-center gap-1.5 text-xs font-bold text-tomato-500 hover:underline justify-self-end">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
