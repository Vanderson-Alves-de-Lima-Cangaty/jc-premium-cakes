export type VulcaoFlavorId =
  | "chocolate"
  | "nesquik"
  | "ninho"
  | "meio-ninho-choco"
  | "meio-nesquik-choco"
  | "maracuja";

export type Massa = "branca" | "chocolate" | "morango";

export type VulcaoAddonId = "kitkat" | "morango_fresco" | "brigadeiros" | "granulado";

export type TopoType = "nenhum" | "simples" | "personalizado";

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
    // 10 pessoas
    basePriceCents: 6000, // massa + recheio + chantilly
    topo: {
      nenhum: 0,
      simples: 1500, // total 75,00
      personalizado: 3000 // total 90,00
    },
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
  const fee = Number(process.env.DELIVERY_FEE_CENTS ?? "500");
  const promoFree = (process.env.PROMO_FREE_DELIVERY ?? "true").toLowerCase() === "true";
  return promoFree ? 0 : (Number.isFinite(fee) ? fee : 0);
}

export function getWhatsappNumber(): string {
  const num = (process.env.WHATSAPP_NUMBER ?? "5569993471428").replace(/\D/g, "");
  if (!num) return "5569993471428";
  return num;
}
