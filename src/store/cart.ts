"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/server/pricing";
import { lineTotalCents } from "@/server/pricing";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeAt: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  clear: () => void;
  countItems: () => number;
  subtotalCents: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: item => set(state => ({ items: [...state.items, item] })),
      removeAt: index => set(state => ({ items: state.items.filter((_, i) => i !== index) })),
      updateQty: (index, qty) =>
        set(state => ({
          items: state.items.map((it, i) => (i === index ? ({ ...it, qty } as any) : it))
        })),
      clear: () => set({ items: [] }),
      countItems: () => get().items.reduce((sum, it) => sum + (it.qty ?? 1), 0),
      subtotalCents: () => get().items.reduce((sum, it) => sum + lineTotalCents(it), 0)
    }),
    { name: "premiun-cakes-cart-v1" }
  )
);
