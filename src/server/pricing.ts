import { CATALOG, getDeliveryFeeCents, type TopoType, type VulcaoAddonId, type VulcaoFlavorId, type Massa } from "@/server/catalog";

export type CartItemVulcao = {
  kind: "vulcao";
  flavorId: VulcaoFlavorId;
  massa: Massa;
  addons: VulcaoAddonId[];
  qty: number;
};

export type CartItemBolo10 = {
  kind: "bolo10";
  massa: Massa;
  fillingId: (typeof CATALOG.bolo10.fillings)[number]["id"];
  topoType: TopoType;
  qty: number;
};

export type CartItem = CartItemVulcao | CartItemBolo10;

export type DeliveryMethod = "retirada" | "entrega";
export type PaymentMethod = "pix" | "dinheiro" | "cartao";

export function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(1, Math.min(20, Math.floor(qty)));
}

export function lineTotalCents(item: CartItem): number {
  if (item.kind === "vulcao") {
    const base = CATALOG.vulcao.basePriceCents;
    const addons = item.addons.reduce((sum, id) => {
      const a = CATALOG.vulcao.addons.find(x => x.id === id);
      return sum + (a?.priceCents ?? 0);
    }, 0);
    return (base + addons) * clampQty(item.qty);
  }

  const base = CATALOG.bolo10.basePriceCents;
  const topoAdd = CATALOG.bolo10.topo[item.topoType] ?? 0;
  return (base + topoAdd) * clampQty(item.qty);
}

export function computeTotalsCents(items: CartItem[], deliveryMethod: DeliveryMethod): { subtotalCents: number; deliveryCents: number; totalCents: number } {
  const subtotalCents = items.reduce((s, it) => s + lineTotalCents(it), 0);
  const deliveryCents = deliveryMethod === "entrega" ? getDeliveryFeeCents() : 0;
  const totalCents = subtotalCents + deliveryCents;
  return { subtotalCents, deliveryCents, totalCents };
}

export function describeItem(item: CartItem): { title: string; lines: string[] } {
  if (item.kind === "vulcao") {
    const flavor = CATALOG.vulcao.flavors.find(f => f.id === item.flavorId)?.name ?? "Mini Bolo Vulcão";
    const massaLabel = CATALOG.masses.find(m => m.id === item.massa)?.label ?? item.massa;
    const addonsNames = item.addons
      .map(id => CATALOG.vulcao.addons.find(a => a.id === id)?.name ?? id)
      .filter(Boolean);

    return {
      title: flavor,
      lines: [
        `Massa: ${massaLabel}`,
        `Adicionais: ${addonsNames.length ? addonsNames.join(", ") : "Nenhum"}`,
        `Qtd: ${clampQty(item.qty)}`
      ]
    };
  }

  const massaLabel = CATALOG.masses.find(m => m.id === item.massa)?.label ?? item.massa;
  const filling = CATALOG.bolo10.fillings.find(f => f.id === item.fillingId)?.name ?? item.fillingId;
  const topoLabel =
    item.topoType === "nenhum" ? "Sem topo" : item.topoType === "simples" ? "Topo simples (tema no WhatsApp)" : "Topo personalizado (tema no WhatsApp)";

  return {
    title: "Bolo 10 pessoas",
    lines: [
      `Massa: ${massaLabel}`,
      `Recheio: ${filling}`,
      `Topo: ${topoLabel}`,
      `Qtd: ${clampQty(item.qty)}`
    ]
  };
}
