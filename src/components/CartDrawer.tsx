"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore, cartItemTotal, cartSubtotal } from "@/lib/cart-store";
import { ProductImage } from "./ProductImage";
import { formatRM } from "@/lib/money";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateInstructions = useCartStore((s) => s.updateInstructions);
  const subtotal = cartSubtotal(items);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-jungle-950/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            role="dialog"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-jungle-100 px-5 py-4">
              <h2 className="font-display text-lg font-extrabold text-jungle-950 flex items-center gap-2">
                <ShoppingBag size={20} /> Your Cart
              </h2>
              <button onClick={closeCart} aria-label="Close cart" className="rounded-full p-2 hover:bg-jungle-100">
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="text-5xl">🛒</span>
                <p className="font-semibold text-jungle-700">Your cart is empty</p>
                <p className="text-sm text-jungle-400">Add something delicious from the menu to get started.</p>
                <Link
                  href="/menu"
                  onClick={closeCart}
                  className="mt-2 rounded-full bg-jungle-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-jungle-700"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      layout
                      key={item.lineId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40, height: 0 }}
                      className="flex gap-3 rounded-2xl border border-jungle-100 bg-white p-3"
                    >
                      <ProductImage category={item.categorySlug} image={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-jungle-950 truncate">{item.name}</p>
                            {item.variantName && <p className="text-xs text-jungle-400">{item.variantName}</p>}
                            {item.addOns.length > 0 && (
                              <p className="text-xs text-jungle-400 truncate">+ {item.addOns.map((a) => a.name).join(", ")}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.lineId)}
                            aria-label={`Remove ${item.name}`}
                            className="shrink-0 rounded-full p-1.5 text-jungle-300 hover:bg-tomato-50 hover:text-tomato-500"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <input
                          value={item.specialInstructions}
                          onChange={(e) => updateInstructions(item.lineId, e.target.value)}
                          placeholder="Add special instructions"
                          className="mt-1.5 w-full rounded-lg border border-jungle-100 bg-jungle-50/60 px-2 py-1 text-[11px] text-jungle-600 focus:outline-none focus:border-jungle-300"
                        />

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-jungle-100 px-1.5 py-0.5">
                            <button
                              onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="rounded-full p-1 hover:bg-jungle-100"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="rounded-full p-1 hover:bg-jungle-100"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-jungle-700">{formatRM(cartItemTotal(item))}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-jungle-100 px-5 py-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-jungle-500">Subtotal</span>
                    <span className="font-bold text-jungle-950">{formatRM(subtotal)}</span>
                  </div>
                  <p className="text-[11px] text-jungle-400">Delivery fee, discounts and total are calculated at checkout.</p>
                  <div className="flex gap-2">
                    <Link
                      href="/menu"
                      onClick={closeCart}
                      className="flex-1 rounded-full border-2 border-jungle-200 py-3 text-center text-sm font-bold text-jungle-700 hover:border-jungle-400"
                    >
                      Continue Shopping
                    </Link>
                    <Link
                      href="/checkout"
                      onClick={closeCart}
                      className="flex-1 rounded-full bg-jungle-600 py-3 text-center text-sm font-bold text-white hover:bg-jungle-700"
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
