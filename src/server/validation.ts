import { z } from "zod";
import { CATALOG } from "@/server/catalog";

const massaEnum = z.enum(["branca", "chocolate", "morango"]);
const vulcaoFlavorEnum = z.enum(CATALOG.vulcao.flavors.map(f => f.id) as [string, ...string[]]);
const vulcaoAddonEnum = z.enum(CATALOG.vulcao.addons.map(a => a.id) as [string, ...string[]]);
const boloFillingEnum = z.enum(CATALOG.bolo10.fillings.map(f => f.id) as [string, ...string[]]);

const flexibleVulcaoFlavor = z.union([vulcaoFlavorEnum, z.string().min(1)]);
const flexibleVulcaoAddon = z.union([vulcaoAddonEnum, z.string().min(1)]);
const flexibleBoloFilling = z.union([boloFillingEnum, z.string().min(1)]);
const topoTypeEnum = z.enum(["nenhum", "simples", "personalizado"]);

const cartItemVulcao = z.object({
  kind: z.literal("vulcao"),
  flavorId: flexibleVulcaoFlavor,
  massa: massaEnum,
  addons: z.array(flexibleVulcaoAddon).default([]),
  qty: z.coerce.number().int().min(1).max(20).default(1)
});

const cartItemBolo10 = z.object({
  kind: z.literal("bolo10"),
  massa: massaEnum,
  fillingId: flexibleBoloFilling,
  topoType: topoTypeEnum.default("nenhum"),
  qty: z.coerce.number().int().min(1).max(20).default(1)
});

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export const orderRequestSchema = z
  .object({
    items: z.array(z.union([cartItemVulcao, cartItemBolo10])).min(1).max(30),
    customerName: z.preprocess(
      emptyToUndefined,
      z.string().min(2, "Nome muito curto").max(50, "Nome muito longo").optional()
    ),
    deliveryMethod: z.enum(["retirada", "entrega"]),
    address: z.preprocess(
      emptyToUndefined,
      z.string().min(2, "Endereço muito curto").max(160, "Endereço muito longo").optional()
    ),
    paymentMethod: z.enum(["pix", "dinheiro", "cartao"])
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "entrega" && !data.address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Endereço é obrigatório para entrega"
      });
    }
  });

export type OrderRequest = z.infer<typeof orderRequestSchema>;
