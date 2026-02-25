import { sanitizeText } from "@/lib/sanitize";
import { getWhatsappNumber } from "@/server/catalog";
import { prisma } from "@/server/db";
import { buildWhatsappMessage } from "@/server/message";
import { generateUniqueOrderCode } from "@/server/orderCode";
import { computeTotalsCents, type CartItem } from "@/server/pricing";
import { rateLimit } from "@/server/rateLimit";
import { orderRequestSchema } from "@/server/validation";
import { NextResponse } from "next/server";

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
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em instantes." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Normaliza payload para não dar 400 por "" / maiúsculas / acentos
    const normalized: any = (body && typeof body === "object") ? { ...body } : {};

    const cleanStr = (v: any) => (typeof v === "string" ? v.trim() : v);

    // strings vazias -> undefined (pra bater com optional)
    normalized.customerName = cleanStr(normalized.customerName);
    if (normalized.customerName === "") delete normalized.customerName;

    normalized.address = cleanStr(normalized.address);
    if (normalized.address === "") delete normalized.address;

    // normalizar enums (aceita "Entrega", "Retirada", "Cartão", "cartão", "PIX" etc.)
    const norm = (v: any) =>
      typeof v === "string"
        ? v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
        : v;

    const dm = norm(normalized.deliveryMethod);
    if (dm === "entrega" || dm === "retirada") normalized.deliveryMethod = dm;

    const pm = norm(normalized.paymentMethod);
    if (pm === "pix" || pm === "dinheiro" || pm === "cartao") normalized.paymentMethod = pm;

    // se não for entrega, nunca validar endereço
    if (normalized.deliveryMethod !== "entrega") delete normalized.address;

    const parsed = orderRequestSchema.safeParse(normalized);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // ✅ TS FIX: após validação Zod, garantimos o tipo esperado pelo pricing/message
    const items = data.items as unknown as CartItem[];

    const customerName = sanitizeText(data.customerName ?? "", 30);
    const address = data.deliveryMethod === "entrega" ? sanitizeText(data.address ?? "", 160) : "";

    if (data.deliveryMethod === "entrega" && !address) {
      return NextResponse.json({ error: "Endereço é obrigatório para entrega." }, { status: 400 });
    }

    const { subtotalCents, deliveryCents, totalCents } = computeTotalsCents(items, data.deliveryMethod);
    const orderCode = await generateUniqueOrderCode();

    const message = buildWhatsappMessage({
      orderCode,
      items,
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
        payloadJson: JSON.stringify({ items, subtotalCents, deliveryCents, totalCents }),
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
