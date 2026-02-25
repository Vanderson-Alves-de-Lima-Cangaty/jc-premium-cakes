"use client";

import { CATALOG } from "@/server/catalog";
import { lineTotalCents, type CartItem } from "@/server/pricing";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeAt: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  clear: () => void;
  countItems: () => number;
  subtotalCents: () => number;
};

const MASSES = new Set(CATALOG.masses.map((m) => m.id));
const TOPO_TYPES = new Set(["nenhum", "simples", "personalizado"]);

function normalizeQty(qty: unknown): number {
  const n = Number(qty);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(20, Math.floor(n)));
}

function normalizeCartItem(input: unknown): CartItem | null {
  if (!input || typeof input !== "object") return null;
  const item = input as Record<string, unknown>;

  if (item.kind === "vulcao") {
    if (typeof item.flavorId !== "string" || !item.flavorId.trim()) return null;
    if (typeof item.massa !== "string" || !MASSES.has(item.massa)) return null;

    const addons = Array.isArray(item.addons)
      ? item.addons.filter((a): a is string => typeof a === "string" && !!a.trim())
      : [];

    return {
      kind: "vulcao",
      flavorId: item.flavorId as any,
      massa: item.massa as any,
      addons: addons as any,
      qty: normalizeQty(item.qty)
    };
  }

  if (item.kind === "bolo10") {
    if (typeof item.fillingId !== "string" || !item.fillingId.trim()) return null;
    if (typeof item.massa !== "string" || !MASSES.has(item.massa)) return null;

    const topoType =
      typeof item.topoType === "string" && TOPO_TYPES.has(item.topoType)
        ? item.topoType
        : "nenhum";

    return {
      kind: "bolo10",
      massa: item.massa as any,
      fillingId: item.fillingId as any,
      topoType: topoType as any,
      qty: normalizeQty(item.qty)
    };
  }

  return null;
}

function normalizeItems(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeCartItem).filter((it): it is CartItem => !!it);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const normalized = normalizeCartItem(item);
        if (!normalized) return;
        set((state) => ({ items: [...state.items, normalized] }));
      },
      removeAt: (index) => set((state) => ({ items: state.items.filter((_, i) => i !== index) })),
      updateQty: (index, qty) =>
        set((state) => ({
          items: state.items.map((it, i) => (i === index ? ({ ...it, qty: normalizeQty(qty) } as any) : it))
        })),
      clear: () => set({ items: [] }),
      countItems: () => get().items.reduce((sum, it) => sum + (it.qty ?? 1), 0),
      subtotalCents: () => get().items.reduce((sum, it) => sum + lineTotalCents(it), 0)
    }),
    {
      name: "premiun-cakes-cart-v1",
      version: 2,
      migrate: (persistedState: unknown) => {
        if (!persistedState || typeof persistedState !== "object") return { items: [] } as CartState;
        const raw = persistedState as Record<string, unknown>;
        return {
          ...raw,
          items: normalizeItems(raw.items)
        } as CartState;
      },
      merge: (persistedState, currentState) => {
        const p = (persistedState ?? {}) as Record<string, unknown>;
        return {
          ...currentState,
          ...p,
          items: normalizeItems(p.items)
        };
      }
    }
  )
);
