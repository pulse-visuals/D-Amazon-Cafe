"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import type { OperatingHours } from "@/lib/settings";

const DAYS: { key: keyof OperatingHours; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [paymentModeEnv, setPaymentModeEnv] = useState("demo");
  const [billplzConfigured, setBillplzConfigured] = useState(false);

  const [cafeName, setCafeName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [taxPercent, setTaxPercent] = useState(0);
  const [serviceChargePercent, setServiceChargePercent] = useState(0);
  const [hours, setHours] = useState<OperatingHours | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        setCafeName(s.cafeName);
        setAddress(s.address);
        setPhone(s.phone);
        setEmail(s.email);
        setWhatsappNumber(s.whatsappNumber);
        setPickupEnabled(s.pickupEnabled);
        setDeliveryEnabled(s.deliveryEnabled);
        setTaxPercent(s.taxPercent);
        setServiceChargePercent(s.serviceChargePercent);
        setHours(s.operatingHours);
        setPaymentModeEnv(data.paymentModeEnv);
        setBillplzConfigured(data.billplzConfigured);
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cafeName, address, phone, email, whatsappNumber, pickupEnabled, deliveryEnabled, taxPercent, serviceChargePercent, operatingHours: hours }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading || !hours) return <Loader2 className="animate-spin text-jungle-400" />;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold text-jungle-950 mb-6">Business Settings</h1>

      <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6 space-y-4 mb-6">
        <h2 className="font-bold text-jungle-900">General</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Cafe Name" value={cafeName} onChange={setCafeName} />
          <TextField label="Phone" value={phone} onChange={setPhone} />
          <TextField label="Email" value={email} onChange={setEmail} />
          <TextField label="WhatsApp Number (digits only, e.g. 60123456789)" value={whatsappNumber} onChange={setWhatsappNumber} />
        </div>
        <TextField label="Address" value={address} onChange={setAddress} textarea />
      </div>

      <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6 space-y-4 mb-6">
        <h2 className="font-bold text-jungle-900">Ordering</h2>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-jungle-700">
            <input type="checkbox" checked={pickupEnabled} onChange={(e) => setPickupEnabled(e.target.checked)} className="h-4 w-4 accent-jungle-600" /> Pickup Enabled
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-jungle-700">
            <input type="checkbox" checked={deliveryEnabled} onChange={(e) => setDeliveryEnabled(e.target.checked)} className="h-4 w-4 accent-jungle-600" /> Delivery Enabled
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Tax (%)" value={String(taxPercent)} onChange={(v) => setTaxPercent(parseFloat(v) || 0)} type="number" />
          <TextField label="Service Charge (%)" value={String(serviceChargePercent)} onChange={(v) => setServiceChargePercent(parseFloat(v) || 0)} type="number" />
        </div>
      </div>

      <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6 space-y-3 mb-6">
        <h2 className="font-bold text-jungle-900">Operating Hours</h2>
        {DAYS.map((d) => (
          <div key={d.key} className="flex items-center gap-3">
            <span className="w-24 text-sm font-semibold text-jungle-600">{d.label}</span>
            <label className="flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={!hours[d.key].closed}
                onChange={(e) => setHours({ ...hours, [d.key]: { ...hours[d.key], closed: !e.target.checked } })}
                className="h-3.5 w-3.5 accent-jungle-600"
              />
              Open
            </label>
            <input
              type="time"
              value={hours[d.key].open}
              disabled={hours[d.key].closed}
              onChange={(e) => setHours({ ...hours, [d.key]: { ...hours[d.key], open: e.target.value } })}
              className="rounded-lg border border-jungle-100 px-2 py-1 text-xs disabled:opacity-40"
            />
            <span className="text-jungle-300">–</span>
            <input
              type="time"
              value={hours[d.key].close}
              disabled={hours[d.key].closed}
              onChange={(e) => setHours({ ...hours, [d.key]: { ...hours[d.key], close: e.target.value } })}
              className="rounded-lg border border-jungle-100 px-2 py-1 text-xs disabled:opacity-40"
            />
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6 mb-6">
        <h2 className="font-bold text-jungle-900 mb-3">Payment Gateway</h2>
        <div className={`flex items-start gap-3 rounded-xl p-4 text-sm ${paymentModeEnv === "live" ? "bg-teal-50 text-teal-800" : "bg-amber-50 text-amber-800"}`}>
          {paymentModeEnv === "live" ? <ShieldCheck size={20} className="shrink-0 mt-0.5" /> : <ShieldAlert size={20} className="shrink-0 mt-0.5" />}
          <div>
            <p className="font-bold uppercase tracking-wide text-xs">{paymentModeEnv === "live" ? "Live Payment Mode" : "Demo Payment Mode"}</p>
            <p className="mt-1">
              {paymentModeEnv === "live"
                ? billplzConfigured
                  ? "Billplz is configured and orders are charged for real."
                  : "PAYMENT_MODE is set to live, but Billplz credentials are missing — checkout will fail. Set BILLPLZ_API_KEY, BILLPLZ_COLLECTION_ID and BILLPLZ_X_SIGNATURE_KEY."
                : "No real payments are processed. To go live, set PAYMENT_MODE=live and the BILLPLZ_* variables in your server environment, then redeploy."}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-jungle-400">
          For security, the payment mode and gateway credentials are controlled only via environment variables — never through this dashboard — so they
          can&apos;t be changed by a compromised admin account or a stray request.
        </p>
      </div>

      <button onClick={save} disabled={saving} className="rounded-full bg-jungle-600 px-8 py-3 font-bold text-white hover:bg-jungle-700 disabled:opacity-60 flex items-center gap-2">
        {saving && <Loader2 className="animate-spin" size={16} />}
        Save Settings
      </button>
      {saved && <span className="ml-3 text-sm font-bold text-teal-600">Saved ✓</span>}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase text-jungle-500 mb-1 block">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="w-full rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm resize-none" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} type={type} className="w-full rounded-xl border-2 border-jungle-100 px-3 py-2 text-sm" />
      )}
    </div>
  );
}
