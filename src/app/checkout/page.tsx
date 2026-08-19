"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronLeft, MapPin, Store, Truck, Loader2, Tag } from "lucide-react";
import { useCartStore, cartSubtotal, cartItemTotal } from "@/lib/cart-store";
import { formatRM } from "@/lib/money";
import { ProductImage } from "@/components/ProductImage";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

type DeliveryZone = { id: string; name: string; areaDescription: string; fee: number; minOrder: number; freeDeliveryThreshold: number | null };
type Settings = { cafeName: string; address: string; whatsappNumber: string; pickupEnabled: boolean; deliveryEnabled: boolean; paymentMode: "demo" | "live" };

const STEPS = ["Order Type", "Your Details", "Review & Pay"];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const subtotal = cartSubtotal(items);

  const [step, setStep] = useState(0);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [scheduleType, setScheduleType] = useState<"asap" | "scheduled">("asap");
  const [scheduledFor, setScheduledFor] = useState("");
  const [deliveryZoneId, setDeliveryZoneId] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("Cheras");
  const [state, setState] = useState("Selangor");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const [discountCode, setDiscountCode] = useState("");
  const [discountPreview, setDiscountPreview] = useState<{ discountAmount: number; freeDelivery: boolean; error?: string } | null>(null);
  const [checkingDiscount, setCheckingDiscount] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/delivery-zones").then((r) => r.json()).then((d) => setZones(d.zones || []));
    fetch("/api/settings").then((r) => r.json()).then((d) => setSettings(d.settings));
  }, []);

  const selectedZone = zones.find((z) => z.id === deliveryZoneId);
  const deliveryFeePreview = useMemo(() => {
    if (orderType !== "delivery" || !selectedZone) return 0;
    if (discountPreview?.freeDelivery) return 0;
    if (selectedZone.freeDeliveryThreshold != null && subtotal >= selectedZone.freeDeliveryThreshold) return 0;
    return selectedZone.fee;
  }, [orderType, selectedZone, subtotal, discountPreview]);

  const discountAmount = discountPreview?.discountAmount || 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFeePreview);

  async function checkDiscount() {
    if (!discountCode.trim()) {
      setDiscountPreview(null);
      return;
    }
    setCheckingDiscount(true);
    try {
      const res = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, subtotal }),
      });
      const data = await res.json();
      setDiscountPreview(data);
    } finally {
      setCheckingDiscount(false);
    }
  }

  function canProceedFromStep0() {
    if (orderType === "delivery" && !deliveryZoneId) return false;
    if (scheduleType === "scheduled" && !scheduledFor) return false;
    return true;
  }

  function canProceedFromStep1() {
    if (customerName.trim().length < 2 || customerPhone.trim().length < 7) return false;
    if (orderType === "delivery" && (!address1.trim() || !postcode.trim() || !city.trim())) return false;
    return true;
  }

  async function placeOrder() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantName: i.variantName,
            addOnIds: i.addOns.map((a) => a.id),
            quantity: i.quantity,
            specialInstructions: i.specialInstructions,
          })),
          orderType,
          scheduleType,
          scheduledFor: scheduleType === "scheduled" ? scheduledFor : undefined,
          customerName,
          customerPhone,
          customerEmail,
          orderNotes,
          deliveryZoneId: orderType === "delivery" ? deliveryZoneId : undefined,
          deliveryAddress1: address1,
          deliveryAddress2: address2,
          deliveryPostcode: postcode,
          deliveryCity: city,
          deliveryState: state,
          deliveryInstructions,
          discountCode: discountCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(data.paymentUrl);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="font-display text-2xl font-extrabold text-jungle-950">Your cart is empty</h1>
        <p className="mt-2 text-jungle-500">Add something delicious before checking out.</p>
        <Link href="/menu" className="mt-6 inline-block rounded-full bg-jungle-600 px-6 py-3 font-bold text-white hover:bg-jungle-700">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Secure Checkout" title="Complete Your Order" compact />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  i < step ? "bg-jungle-600 text-white" : i === step ? "bg-gold-400 text-jungle-950" : "bg-jungle-100 text-jungle-400"
                )}
              >
                {i < step ? <Check size={15} /> : i + 1}
              </div>
              <span className={cn("hidden sm:inline text-sm font-semibold", i === step ? "text-jungle-950" : "text-jungle-400")}>{label}</span>
              {i < STEPS.length - 1 && <div className="w-8 sm:w-14 h-0.5 bg-jungle-100" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              {step === 0 && (
                <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6 sm:p-8">
                  <h2 className="font-display text-xl font-extrabold text-jungle-950 mb-5">How would you like your order?</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {settings?.pickupEnabled !== false && (
                      <button
                        onClick={() => setOrderType("pickup")}
                        className={cn(
                          "flex flex-col items-start gap-2 rounded-2xl border-2 p-5 text-left transition-colors",
                          orderType === "pickup" ? "border-jungle-600 bg-jungle-50" : "border-jungle-100 hover:border-jungle-300"
                        )}
                      >
                        <Store className="text-jungle-600" size={26} />
                        <span className="font-bold text-jungle-950">Pickup</span>
                        <span className="text-sm text-jungle-500">Collect from D&apos;Amazon Cafe, Sungai Long</span>
                      </button>
                    )}
                    {settings?.deliveryEnabled !== false && (
                      <button
                        onClick={() => setOrderType("delivery")}
                        className={cn(
                          "flex flex-col items-start gap-2 rounded-2xl border-2 p-5 text-left transition-colors",
                          orderType === "delivery" ? "border-jungle-600 bg-jungle-50" : "border-jungle-100 hover:border-jungle-300"
                        )}
                      >
                        <Truck className="text-jungle-600" size={26} />
                        <span className="font-bold text-jungle-950">Delivery</span>
                        <span className="text-sm text-jungle-500">Delivered to your doorstep</span>
                      </button>
                    )}
                  </div>

                  {orderType === "pickup" && (
                    <div className="mt-6 flex items-start gap-2 rounded-xl bg-jungle-50 p-4 text-sm text-jungle-700">
                      <MapPin size={18} className="shrink-0 text-jungle-500 mt-0.5" />
                      <span>{settings?.address || "Shop No. R03, Lot.683, Monkeys Canopy Resort, Jalan Persiaran Bukit Enggang SG Long Hill, Sungai Long, Cheras, Selangor, Malaysia"}</span>
                    </div>
                  )}

                  {orderType === "delivery" && (
                    <div className="mt-6">
                      <p className="text-xs font-bold uppercase tracking-wide text-jungle-500 mb-2">Delivery Zone</p>
                      <div className="space-y-2">
                        {zones.map((z) => (
                          <label
                            key={z.id}
                            className={cn(
                              "flex items-center justify-between rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors",
                              deliveryZoneId === z.id ? "border-jungle-600 bg-jungle-50" : "border-jungle-100 hover:border-jungle-300"
                            )}
                          >
                            <span>
                              <span className="block font-semibold text-jungle-900 text-sm">{z.name}</span>
                              <span className="block text-xs text-jungle-500">{z.areaDescription}</span>
                              {z.minOrder > 0 && <span className="block text-xs text-jungle-400">Min order {formatRM(z.minOrder)}</span>}
                            </span>
                            <span className="flex items-center gap-3">
                              <span className="font-bold text-jungle-700 text-sm">{formatRM(z.fee)}</span>
                              <input type="radio" name="zone" checked={deliveryZoneId === z.id} onChange={() => setDeliveryZoneId(z.id)} />
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-jungle-500 mb-2">
                      {orderType === "pickup" ? "Pickup Time" : "Delivery Time"}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setScheduleType("asap")}
                        className={cn("rounded-full border-2 px-4 py-2 text-sm font-semibold", scheduleType === "asap" ? "border-jungle-600 bg-jungle-600 text-white" : "border-jungle-100 text-jungle-600")}
                      >
                        ASAP
                      </button>
                      <button
                        onClick={() => setScheduleType("scheduled")}
                        className={cn("rounded-full border-2 px-4 py-2 text-sm font-semibold", scheduleType === "scheduled" ? "border-jungle-600 bg-jungle-600 text-white" : "border-jungle-100 text-jungle-600")}
                      >
                        Schedule
                      </button>
                    </div>
                    {scheduleType === "scheduled" && (
                      <input
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        className="mt-3 w-full rounded-xl border-2 border-jungle-100 px-3.5 py-2.5 text-sm focus:border-jungle-400 focus:outline-none"
                      />
                    )}
                  </div>

                  <button
                    onClick={() => canProceedFromStep0() && setStep(1)}
                    disabled={!canProceedFromStep0()}
                    className="mt-8 w-full rounded-full bg-jungle-600 py-3.5 font-bold text-white hover:bg-jungle-700 disabled:bg-jungle-200 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6 sm:p-8">
                  <h2 className="font-display text-xl font-extrabold text-jungle-950 mb-5">Your Details</h2>
                  <p className="text-sm text-jungle-500 mb-5">No account needed — checkout as a guest, or continue if you&apos;re signed in.</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full Name *">
                      <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} placeholder="Ahmad Ali" />
                    </Field>
                    <Field label="Mobile Number *">
                      <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={inputClass} placeholder="012-345 6789" />
                    </Field>
                    <Field label="Email Address" className="sm:col-span-2">
                      <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
                    </Field>
                    <Field label="Order Notes" className="sm:col-span-2">
                      <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} rows={2} className={cn(inputClass, "resize-none")} placeholder="Anything we should know?" />
                    </Field>
                  </div>

                  {orderType === "delivery" && (
                    <>
                      <h3 className="font-display text-lg font-bold text-jungle-950 mt-6 mb-3">Delivery Address</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Address Line 1 *" className="sm:col-span-2">
                          <input value={address1} onChange={(e) => setAddress1(e.target.value)} className={inputClass} placeholder="House / unit no., street" />
                        </Field>
                        <Field label="Address Line 2" className="sm:col-span-2">
                          <input value={address2} onChange={(e) => setAddress2(e.target.value)} className={inputClass} placeholder="Optional" />
                        </Field>
                        <Field label="Postcode *">
                          <input value={postcode} onChange={(e) => setPostcode(e.target.value)} className={inputClass} placeholder="43000" />
                        </Field>
                        <Field label="City *">
                          <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="State *">
                          <input value={state} onChange={(e) => setState(e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Delivery Instructions" className="sm:col-span-2">
                          <input value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} className={inputClass} placeholder="Gate code, landmark, etc." />
                        </Field>
                      </div>
                    </>
                  )}

                  <div className="mt-8 flex gap-3">
                    <button onClick={() => setStep(0)} className="inline-flex items-center gap-1.5 rounded-full border-2 border-jungle-200 px-5 py-3 font-bold text-jungle-700 hover:border-jungle-400">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button
                      onClick={() => canProceedFromStep1() && setStep(2)}
                      disabled={!canProceedFromStep1()}
                      className="flex-1 rounded-full bg-jungle-600 py-3 font-bold text-white hover:bg-jungle-700 disabled:bg-jungle-200 disabled:cursor-not-allowed"
                    >
                      Continue to Review
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="rounded-3xl bg-white card-shadow border border-jungle-50 p-6 sm:p-8">
                  <h2 className="font-display text-xl font-extrabold text-jungle-950 mb-5">Review &amp; Pay</h2>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.lineId} className="flex gap-3 items-center">
                        <ProductImage category={item.categorySlug} image={item.image} alt={item.name} className="h-12 w-12 rounded-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-jungle-900 truncate">
                            {item.quantity}× {item.name} {item.variantName && `(${item.variantName})`}
                          </p>
                          {item.addOns.length > 0 && <p className="text-xs text-jungle-400 truncate">+ {item.addOns.map((a) => a.name).join(", ")}</p>}
                        </div>
                        <span className="text-sm font-bold text-jungle-700">{formatRM(cartItemTotal(item))}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-jungle-400" size={16} />
                      <input
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="Discount code"
                        className="w-full rounded-full border-2 border-jungle-100 py-2.5 pl-10 pr-4 text-sm focus:border-jungle-400 focus:outline-none"
                      />
                    </div>
                    <button onClick={checkDiscount} disabled={checkingDiscount} className="rounded-full bg-jungle-100 px-4 py-2.5 text-sm font-bold text-jungle-700 hover:bg-jungle-200">
                      {checkingDiscount ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
                    </button>
                  </div>
                  {discountPreview?.error && <p className="mt-1.5 text-xs text-tomato-600">{discountPreview.error}</p>}
                  {discountPreview && !discountPreview.error && (discountAmount > 0 || discountPreview.freeDelivery) && (
                    <p className="mt-1.5 text-xs text-teal-600 font-semibold">Discount applied ✓</p>
                  )}

                  <div className="mt-5 space-y-2 border-t border-jungle-100 pt-4 text-sm">
                    <Row label="Subtotal" value={formatRM(subtotal)} />
                    {discountAmount > 0 && <Row label="Discount" value={`-${formatRM(discountAmount)}`} highlight />}
                    {orderType === "delivery" && <Row label="Delivery Fee" value={deliveryFeePreview === 0 ? "FREE" : formatRM(deliveryFeePreview)} />}
                    <Row label="Total" value={formatRM(total)} bold />
                  </div>

                  <div className="mt-5 rounded-xl bg-jungle-50 p-4 text-xs text-jungle-600">
                    {settings?.paymentMode === "live" ? (
                      <p>🔒 You&apos;ll be redirected to Billplz to complete a secure payment.</p>
                    ) : (
                      <p>
                        🧪 <strong>DEMO PAYMENT MODE</strong> — no real gateway or money is involved. You&apos;ll see a clearly labeled
                        simulator to confirm this test order.
                      </p>
                    )}
                  </div>

                  {error && <p className="mt-4 text-sm font-semibold text-tomato-600">{error}</p>}

                  <div className="mt-6 flex gap-3">
                    <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 rounded-full border-2 border-jungle-200 px-5 py-3 font-bold text-jungle-700 hover:border-jungle-400">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button
                      onClick={placeOrder}
                      disabled={submitting}
                      className="flex-1 rounded-full bg-gold-400 py-3 font-bold text-jungle-950 hover:bg-gold-300 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 className="animate-spin" size={16} />}
                      {submitting ? "Placing Order..." : `Place Order — ${formatRM(total)}`}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order summary sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl bg-jungle-950 text-white p-6">
              <h3 className="font-display font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.lineId} className="flex justify-between text-jungle-200">
                    <span className="truncate pr-2">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="shrink-0">{formatRM(cartItemTotal(item))}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-white/10 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-jungle-300">
                  <span>Subtotal</span>
                  <span>{formatRM(subtotal)}</span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between text-jungle-300">
                    <span>Delivery</span>
                    <span>{deliveryFeePreview === 0 ? "FREE" : formatRM(deliveryFeePreview)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-gold-300">
                    <span>Discount</span>
                    <span>-{formatRM(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10 mt-2">
                  <span>Total</span>
                  <span>{formatRM(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const inputClass = "w-full rounded-xl border-2 border-jungle-100 px-3.5 py-2.5 text-sm focus:border-jungle-400 focus:outline-none";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-jungle-500">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "text-lg font-extrabold text-jungle-950 pt-2 border-t border-jungle-100")}>
      <span className={cn(!bold && "text-jungle-500", highlight && "text-teal-600 font-semibold")}>{label}</span>
      <span className={cn(!bold && "font-semibold text-jungle-800", highlight && "text-teal-600 font-semibold")}>{value}</span>
    </div>
  );
}
