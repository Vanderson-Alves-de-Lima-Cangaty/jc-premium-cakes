import { formatMoney } from "@/lib/money";
import { sanitizeText } from "@/lib/sanitize";
import { describeItem, type CartItem } from "@/server/pricing";

export type DeliveryMethod = "retirada" | "entrega";
export type PaymentMethod = "pix" | "dinheiro" | "cartao";

export function buildWhatsappMessage(params: {
  orderCode: string;
  items: CartItem[];
  customerName?: string;
  deliveryMethod: DeliveryMethod;
  address?: string;
  paymentMethod: PaymentMethod;
  subtotalCents: number;
  deliveryCents: number;
  totalCents: number;
}): string {
  const name = sanitizeText(params.customerName ?? "", 30);
  const address = sanitizeText(params.address ?? "", 160);

  const header = `Olá! Quero fazer um pedido na Premiun cakes jc 🍰\n\nPedido: ${params.orderCode}`;
  const who = name ? `\nCliente: ${name}` : "";

  const itemsText = params.items
    .map((it, idx) => {
      const d = describeItem(it);
      const block = [`${idx + 1}) ${d.title}`, ...d.lines.map((l) => `- ${l}`)].join("\n");
      return block;
    })
    .join("\n\n");

  const PICKUP_LOCATION = "Santa Luzia, Av. Miguel Hatzinakis, 2384";

const deliveryLine =
  params.deliveryMethod === "entrega"
    ? `Entrega/Retirada: Entrega\nEndereço: ${address || "(informar endereço)"}`
    : `Entrega/Retirada: Retirada\nLocal: ${PICKUP_LOCATION}`;

  const payLabel =
    params.paymentMethod === "pix"
      ? "PIX"
      : params.paymentMethod === "dinheiro"
      ? "Dinheiro"
      : "Cartão (débito/crédito)";

  const totals = [
    `Subtotal: ${formatMoney(params.subtotalCents)}`,
    params.deliveryCents ? `Entrega: ${formatMoney(params.deliveryCents)}` : "Entrega: R$ 0,00",
    `Total: ${formatMoney(params.totalCents)}`
  ].join("\n");

  const topperNote = "\n\nObs.: Tema do topo (simples/personalizado) a combinar aqui no WhatsApp.";

  const footer = `\n\n${deliveryLine}\nPagamento: ${payLabel}\n\n${totals}\n\nAtendimento: finais de semana${topperNote}`;

  return `${header}${who}\n\nItens:\n${itemsText}${footer}`;
}
