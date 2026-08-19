"use client";

import { create } from "zustand";

type ProductModalState = {
  openProductId: string | null;
  open: (productId: string) => void;
  close: () => void;
};

export const useProductModalStore = create<ProductModalState>((set) => ({
  openProductId: null,
  open: (productId) => set({ openProductId: productId }),
  close: () => set({ openProductId: null }),
}));
