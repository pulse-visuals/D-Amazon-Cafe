"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Check } from "lucide-react";
import { useProductModalStore } from "@/lib/product-modal-store";
import { useCartStore } from "@/lib/cart-store";
import { ProductImage } from "./ProductImage";
import { BestSellerBadge, NewBadge, SoldOutBadge } from "./Badges";
import { formatRM } from "@/lib/money";
import type { ProductDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductModal() {
  const openProductId = useProductModalStore((s) => s.openProductId);
  const close = useProductModalStore((s) => s.close);
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const loading = !!openProductId && loadedFor !== openProductId;

  useEffect(() => {
    if (!openProductId) return;
    let cancelled = false;
    fetch(`/api/products/${openProductId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setProduct(data.product || null);
          setLoadedFor(openProductId);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [openProductId]);

  useEffect(() => {
    if (!openProductId) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openProductId, close]);

  return (
    <AnimatePresence>
      {openProductId && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-jungle-950/70 backdrop-blur-sm"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={product?.name || "Product details"}
            className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-cream-50 shadow-2xl"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-md hover:bg-white transition-colors"
            >
              <X size={18} />
            </button>

            {loading || !product ? (
              <div className="h-96 animate-pulse bg-jungle-100" />
            ) : (
              <ProductModalContent product={product} onDone={close} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProductModalContent({ product, onDone }: { product: ProductDTO; onDone: () => void }) {
  const addItem = useCartStore((s) => s.addItem);
  const [variantName, setVariantName] = useState(product.variants[0]?.name || "");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const unitPrice = useMemo(() => {
    if (product.variants.length > 0) {
      return product.variants.find((v) => v.name === variantName)?.price ?? product.basePrice;
    }
    return product.basePrice;
  }, [product, variantName]);

  const addOnsTotal = useMemo(
    () => product.addOns.filter((a) => selectedAddOns.includes(a.id)).reduce((s, a) => s + a.price, 0),
    [product.addOns, selectedAddOns]
  );

  const totalPrice = (unitPrice + addOnsTotal) * quantity;
  const soldOut = product.isSoldOut || !product.isAvailable;

  function toggleAddOn(id: string) {
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  function handleAdd() {
    if (soldOut) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      categorySlug: product.categorySlug,
      variantName,
      unitPrice,
      addOns: product.addOns.filter((a) => selectedAddOns.includes(a.id)),
      quantity,
      specialInstructions: instructions.trim(),
    });
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onDone();
    }, 650);
  }

  return (
    <div>
      <ProductImage category={product.categorySlug} image={product.image} alt={product.name} className="h-56 sm:h-64 w-full rounded-t-3xl sm:rounded-t-3xl" />

      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {product.isBestSeller && <BestSellerBadge />}
          {product.isNew && <NewBadge />}
          {soldOut && <SoldOutBadge />}
        </div>

        <h2 className="font-display text-2xl font-extrabold text-jungle-950">{product.name}</h2>
        <p className="mt-2 text-sm text-jungle-700 leading-relaxed">{product.description}</p>

        {product.variants.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-jungle-500 mb-2">Choose an option</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantName(v.name)}
                  className={cn(
                    "rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors",
                    variantName === v.name
                      ? "border-jungle-600 bg-jungle-600 text-white"
                      : "border-jungle-200 text-jungle-700 hover:border-jungle-400"
                  )}
                >
                  {v.name} · {formatRM(v.price)}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.addOns.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-jungle-500 mb-2">Add-ons</p>
            <div className="space-y-2">
              {product.addOns.map((a) => {
                const checked = selectedAddOns.includes(a.id);
                return (
                  <label
                    key={a.id}
                    className={cn(
                      "flex items-center justify-between rounded-xl border-2 px-4 py-2.5 cursor-pointer transition-colors",
                      checked ? "border-jungle-500 bg-jungle-50" : "border-jungle-100 hover:border-jungle-200"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-md border-2",
                          checked ? "bg-jungle-600 border-jungle-600 text-white" : "border-jungle-300"
                        )}
                      >
                        {checked && <Check size={13} />}
                      </span>
                      <span className="text-sm font-medium text-jungle-800">{a.name}</span>
                    </span>
                    <span className="text-sm font-semibold text-jungle-600">+{formatRM(a.price)}</span>
                    <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleAddOn(a.id)} />
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {product.allowSpecialInstructions && (
          <div className="mt-5">
            <label className="text-xs font-bold uppercase tracking-wide text-jungle-500 mb-2 block">
              Special instructions <span className="normal-case font-normal text-jungle-400">(optional)</span>
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value.slice(0, 300))}
              placeholder="e.g. Less spicy, please"
              rows={2}
              className="w-full rounded-xl border-2 border-jungle-100 px-3.5 py-2.5 text-sm focus:border-jungle-400 focus:outline-none resize-none"
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-jungle-500">Quantity</p>
          <div className="flex items-center gap-3 rounded-full border-2 border-jungle-100 px-2 py-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="rounded-full p-1.5 hover:bg-jungle-100 active:scale-90 transition-transform"
            >
              <Minus size={16} />
            </button>
            <span className="w-6 text-center font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(50, q + 1))}
              aria-label="Increase quantity"
              className="rounded-full p-1.5 hover:bg-jungle-100 active:scale-90 transition-transform"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={soldOut}
          className={cn(
            "mt-6 w-full rounded-full py-3.5 text-center font-bold text-white shadow-lg transition-all active:scale-[0.98]",
            soldOut ? "bg-jungle-300 cursor-not-allowed" : justAdded ? "bg-teal-500" : "bg-jungle-600 hover:bg-jungle-700"
          )}
        >
          {soldOut ? "SOLD OUT" : justAdded ? "ADDED TO CART ✓" : `ADD TO CART — ${formatRM(totalPrice)}`}
        </button>
      </div>
    </div>
  );
}
