import { env } from "@/lib/env";

export type VulcaoFlavorId =
  | "chocolate"
  | "nesquik"
  | "ninho"
  | "meio-ninho-choco"
  | "meio-nesquik-choco"
  | "maracuja";

export type Massa = "branca" | "chocolate" | "morango";

export type VulcaoAddonId = "kitkat" | "morango_fresco" | "brigadeiros" | "granulado";

export type CoberturaBolo10Id = "calda_chocolate" | "chantilly";

export const CATALOG = {
  masses: [
    { id: "branca", label: "Massa branca" },
    { id: "chocolate", label: "Massa chocolate" },
    { id: "morango", label: "Massa morango" }
  ] as const,
  vulcao: {
    basePriceCents: 1499,
    flavors: [
      { id: "chocolate", name: "Vulcão Chocolate" },
      { id: "nesquik", name: "Vulcão Nesquik (morango)" },
      { id: "ninho", name: "Vulcão Leite Ninho" },
      { id: "meio-ninho-choco", name: "Vulcão Metade Ninho + Chocolate" },
      { id: "meio-nesquik-choco", name: "Vulcão Metade Nesquik + Chocolate" },
      { id: "maracuja", name: "Vulcão Maracujá" }
    ] as const,
    addons: [
      { id: "kitkat", name: "KitKat", priceCents: 700 },
      { id: "morango_fresco", name: "Morango fresco", priceCents: 500 },
      { id: "brigadeiros", name: "Brigadeiros", priceCents: 550 },
      { id: "granulado", name: "Granulado", priceCents: 0 }
    ] as const
  },
  bolo10: {
    basePriceCents: 6000,
    coberturas: [
      { id: "calda_chocolate", name: "Calda de Chocolate", priceCents: 0 },
      { id: "chantilly", name: "Chantilly", priceCents: 0 }
    ] as const,
    fillings: [
      { id: "maracuja", name: "Maracujá" },
      { id: "ninho", name: "Leite Ninho" },
      { id: "quatro-leites", name: "4 Leites" },
      { id: "brigadeiro", name: "Brigadeiro" },
      { id: "prestigio", name: "Prestígio" },
      { id: "chocolate", name: "Chocolate" },
      { id: "morango", name: "Morango" },
      { id: "abacaxi", name: "Abacaxi" }
    ] as const
  }
} as const;

export function getDeliveryFeeCents(): number {
  return env.NEXT_PUBLIC_PROMO_FREE_DELIVERY ? 0 : env.NEXT_PUBLIC_DELIVERY_FEE_CENTS;
}

export function getWhatsappNumber(): string {
  return env.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/\D/g, "");
}
