import { NextResponse } from "next/server";
import { orderRequestSchema } from "@/server/validation";
import { computeTotalsCents } from "@/server/pricing";
import { buildWhatsappMessage } from "@/server/message";
import { getWhatsappNumber } from "@/server/catalog";
import { prisma } from "@/server/db";
import { generateUniqueOrderCode } from "@/server/orderCode";
import { sanitizeText } from "@/lib/sanitize";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";

function getIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function enforceOrigin(req: Request) {
  const allowed = process.env.APP_ORIGIN?.trim();
  if (!allowed) return; // disabled by default
  const origin = req.headers.get("origin")?.trim();
  if (!origin || origin !== allowed) {
    throw new Error("Origin not allowed");
  }
}

export async function POST(req: Request) {
  try {
    enforceOrigin(req);

    const ip = getIp(req);
    const result = await rateLimit(`orders:${ip}`, 20, 60_000); // 20/min por IP
    if (!result.success) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = orderRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    const customerName = sanitizeText(data.customerName ?? "", 30);
    const address = data.deliveryMethod === "entrega" ? sanitizeText(data.address ?? "", 120) : "";

    if (data.deliveryMethod === "entrega" && !address) {
      return NextResponse.json({ error: "Endereço é obrigatório para entrega." }, { status: 400 });
    }

    const { subtotalCents, deliveryCents, totalCents } = computeTotalsCents(data.items, data.deliveryMethod);
    const orderCode = await generateUniqueOrderCode();

    const message = buildWhatsappMessage({
      orderCode,
      items: data.items,
      customerName,
      deliveryMethod: data.deliveryMethod,
      address,
      paymentMethod: data.paymentMethod,
      subtotalCents,
      deliveryCents,
      totalCents
    });

    const whatsapp = getWhatsappNumber();
    const waUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

    const order = await prisma.order.create({
      data: {
        code: orderCode,
        totalCents,
        payloadJson: JSON.stringify({ items: data.items, subtotalCents, deliveryCents, totalCents }),
        customerName: customerName || null,
        address: address || null,
        deliveryMethod: data.deliveryMethod,
        paymentMethod: data.paymentMethod
      },
      select: { code: true, totalCents: true, createdAt: true }
    });

    return NextResponse.json({
      orderCode: order.code,
      totalCents: order.totalCents,
      waUrl
    });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "Erro inesperado";
    const status = msg.includes("Origin not allowed") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
