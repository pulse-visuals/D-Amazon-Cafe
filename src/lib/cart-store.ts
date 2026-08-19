"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartAddOn = { id: string; name: string; price: number }; // price in sen

export type CartItem = {
  lineId: string; // unique per cart line (same product/variant/addons can appear as separate lines)
  productId: string;
  slug: string;
  name: string;
  image: string;
  categorySlug: string;
  variantName: string; // "" if none
  unitPrice: number; // sen, product/variant price only (excludes add-ons)
  addOns: CartAddOn[];
  quantity: number;
  specialInstructions: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  updateInstructions: (lineId: string, instructions: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

function lineKey(item: Omit<CartItem, "lineId">) {
  const addOnKey = item.addOns.map((a) => a.id).sort().join(",");
  return `${item.productId}|${item.variantName}|${addOnKey}|${item.specialInstructions.trim()}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const key = lineKey(item);
        const existing = get().items.find((i) => lineKey(i) === key);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.lineId === existing.lineId ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({
            items: [...get().items, { ...item, lineId: `${key}|${Date.now()}` }],
          });
        }
        set({ isOpen: true });
      },
      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.lineId !== lineId) });
          return;
        }
        set({ items: get().items.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)) });
      },
      removeItem: (lineId) => set({ items: get().items.filter((i) => i.lineId !== lineId) }),
      updateInstructions: (lineId, specialInstructions) =>
        set({ items: get().items.map((i) => (i.lineId === lineId ? { ...i, specialInstructions } : i)) }),
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
    }),
    {
      name: "damazon-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function cartItemTotal(item: CartItem): number {
  const addOnsTotal = item.addOns.reduce((sum, a) => sum + a.price, 0);
  return (item.unitPrice + addOnsTotal) * item.quantity;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + cartItemTotal(i), 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
