"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCartStore, cartCount, cartSubtotal } from "@/lib/cart-store";
import { formatRM } from "@/lib/money";

export function StickyMobileBar() {
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);

  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 pb-[env(safe-area-inset-bottom)] print:hidden">
      <AnimatePresence mode="wait">
        {count > 0 ? (
          <motion.button
            key="cart-bar"
            onClick={openCart}
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="mx-3 mb-3 flex w-[calc(100%-1.5rem)] items-center justify-between rounded-full bg-jungle-700 px-5 py-3.5 text-white shadow-2xl active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-2 font-bold text-sm">
              <span className="relative">
                <ShoppingCart size={20} />
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-jungle-950">
                  {count}
                </span>
              </span>
              View Cart
            </span>
            <span className="font-bold text-sm">{formatRM(subtotal)}</span>
          </motion.button>
        ) : (
          <motion.div key="order-bar" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: "spring", damping: 28, stiffness: 320 }} className="mx-3 mb-3">
            <Link
              href="/menu"
              className="flex items-center justify-center gap-2 rounded-full bg-gold-400 px-5 py-3.5 font-bold text-jungle-950 shadow-2xl active:scale-[0.98] transition-transform"
            >
              🍽️ ORDER NOW
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
