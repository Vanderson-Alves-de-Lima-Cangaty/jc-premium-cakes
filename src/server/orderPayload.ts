import type { DeliveryMethod, PaymentMethod } from "@/server/pricing";

export const emptyToUndefined = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const normalizeText = (value: unknown): string =>
  typeof value === "string"
    ? value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
    : "";

export const normalizeDeliveryMethod = (value: unknown): DeliveryMethod => {
  const normalized = normalizeText(value);
  if (normalized === "entrega" || normalized === "retirada") return normalized;
  return "retirada";
};

export const normalizePaymentMethod = (value: unknown): PaymentMethod => {
  const normalized = normalizeText(value);
  if (normalized === "pix" || normalized === "dinheiro") return normalized;
  if (normalized === "cartao" || normalized === "cartao de credito" || normalized === "cartao de debito") return "cartao";
  return "pix";
};

export const normalizeOrderPayload = (body: unknown): Record<string, unknown> => {
  const normalized: Record<string, unknown> = body && typeof body === "object" ? { ...(body as Record<string, unknown>) } : {};

  normalized.customerName = emptyToUndefined(normalized.customerName);
  normalized.address = emptyToUndefined(normalized.address);

  normalized.deliveryMethod = normalizeDeliveryMethod(normalized.deliveryMethod);
  normalized.paymentMethod = normalizePaymentMethod(normalized.paymentMethod);

  if (normalized.deliveryMethod !== "entrega") {
    delete normalized.address;
  }

  return normalized;
};

export const normalizeTextKey = normalizeText;
