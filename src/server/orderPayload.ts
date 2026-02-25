import { emptyToUndefined, normalizeText } from "@/shared/validation/normalizers";

export { emptyToUndefined };

export const normalizeDeliveryMethod = (value: unknown): "entrega" | "retirada" | undefined => {
  const normalized = normalizeText(value);
  if (normalized === "entrega" || normalized === "retirada") return normalized;
  return undefined;
};

export const normalizePaymentMethod = (value: unknown): "pix" | "dinheiro" | "cartao" | undefined => {
  const normalized = normalizeText(value);
  if (normalized === "pix" || normalized === "dinheiro") return normalized;
  if (normalized === "cartao" || normalized === "cartao de credito" || normalized === "cartao de debito") return "cartao";
  return undefined;
};

export const normalizeOrderPayload = (body: unknown): Record<string, unknown> => {
  const normalized: Record<string, unknown> = body && typeof body === "object" ? { ...(body as Record<string, unknown>) } : {};

  normalized.customerName = emptyToUndefined(normalized.customerName);
  normalized.address = emptyToUndefined(normalized.address);

  const deliveryMethod = normalizeDeliveryMethod(normalized.deliveryMethod);
  if (deliveryMethod) {
    normalized.deliveryMethod = deliveryMethod;
  }

  const paymentMethod = normalizePaymentMethod(normalized.paymentMethod);
  if (paymentMethod) {
    normalized.paymentMethod = paymentMethod;
  }

  if (deliveryMethod === "retirada") {
    delete normalized.address;
  }

  return normalized;
};

export const normalizeTextKey = normalizeText;
