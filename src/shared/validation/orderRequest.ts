import { z } from "zod";
import { emptyToUndefined } from "@/shared/validation/normalizers";

const massaEnum = z.enum(["branca", "chocolate", "morango"]);
const vulcaoFlavorEnum = z.enum([
  "chocolate",
  "nesquik",
  "ninho",
  "meio-ninho-choco",
  "meio-nesquik-choco",
  "maracuja"
]);
const vulcaoAddonEnum = z.enum(["kitkat", "morango_fresco", "brigadeiros", "granulado"]);
const boloFillingEnum = z.enum(["maracuja", "ninho", "quatro-leites", "brigadeiro", "prestigio", "chocolate", "morango", "abacaxi"]);
const topoTypeEnum = z.enum(["nenhum", "simples", "personalizado"]);

const cartItemVulcao = z.object({
  kind: z.literal("vulcao"),
  flavorId: vulcaoFlavorEnum,
  massa: massaEnum,
  addons: z.array(vulcaoAddonEnum).default([]),
  qty: z.coerce.number().int().min(1).max(20).default(1)
});

const cartItemBolo10 = z.object({
  kind: z.literal("bolo10"),
  massa: massaEnum,
  fillingId: boloFillingEnum,
  topoType: topoTypeEnum.default("nenhum"),
  qty: z.coerce.number().int().min(1).max(20).default(1)
});

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
      z.string().min(8, "Endereço muito curto").max(200, "Endereço muito longo").optional()
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
