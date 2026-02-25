import { z } from "zod";
import { CATALOG } from "@/server/catalog";

const massaEnum = z.enum(["branca", "chocolate", "morango"]);
const vulcaoFlavorEnum = z.enum(CATALOG.vulcao.flavors.map(f => f.id) as [string, ...string[]]);
const vulcaoAddonEnum = z.enum(CATALOG.vulcao.addons.map(a => a.id) as [string, ...string[]]);
const boloFillingEnum = z.enum(CATALOG.bolo10.fillings.map(f => f.id) as [string, ...string[]]);
const topoTypeEnum = z.enum(["nenhum", "simples", "personalizado"]);

const cartItemVulcao = z.object({
  kind: z.literal("vulcao"),
  flavorId: vulcaoFlavorEnum,
  massa: massaEnum,
  addons: z.array(vulcaoAddonEnum).default([]),
  qty: z.number().int().min(1).max(20)
});

const cartItemBolo10 = z.object({
  kind: z.literal("bolo10"),
  massa: massaEnum,
  fillingId: boloFillingEnum,
  topoType: topoTypeEnum,
  qty: z.number().int().min(1).max(20)
});

export const orderRequestSchema = z.object({
  items: z.array(z.union([cartItemVulcao, cartItemBolo10])).min(1).max(30),
  customerName: z.string().min(2, "Nome muito curto").max(50, "Nome muito longo").optional(),
  deliveryMethod: z.enum(["retirada", "entrega"]),
  address: z.string().min(2, "Endereço muito curto").max(150, "Endereço muito longo").optional(),
  paymentMethod: z.enum(["pix", "dinheiro", "cartao"])
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;
