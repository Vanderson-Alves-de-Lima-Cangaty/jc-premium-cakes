import { NextResponse } from "next/server";
import { orderRequestSchema } from "@/server/validation";
import { computeTotalsCents, type CartItem } from "@/server/pricing";
import { buildWhatsappMessage } from "@/server/message";
import { getWhatsappNumber, CATALOG } from "@/server/catalog";
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
  if (!allowed) return;
  const origin = req.headers.get("origin")?.trim();
  if (!origin || origin !== allowed) throw new Error("Origin not allowed");
}

const norm = (v: unknown) =>
  typeof v === "string"
    ? v
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
    : "";

const emptyToUndef = (v: unknown) => {
  if (typeof v !== "string") return v;
  const t = v.trim();
  return t === "" ? undefined : t;
};

const clampInt = (n: unknown, min: number, max: number, fallback: number) => {
  const x = typeof n === "number" ? n : typeof n === "string" ? Number(n) : NaN;
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(x)));
};

// ---- maps para aceitar "labels" e converter para ids ----
const MASS_BY_ANY = new Map<string, "branca" | "chocolate" | "morango">([
  ["branca", "branca"],
  ["massa branca", "branca"],
  ["chocolate", "chocolate"],
  ["massa chocolate", "chocolate"],
  ["morango", "morango"],
  ["massa morango", "morango"]
]);

const FLAVOR_BY_ANY = new Map<string, (typeof CATALOG.vulcao.flavors)[number]["id"]>();
for (const f of CATALOG.vulcao.flavors) {
  // aceita o id
  FLAVOR_BY_ANY.set(norm(f.id), f.id);
  // aceita o nome inteiro ("Vulcão Maracujá")
  FLAVOR_BY_ANY.set(norm(f.name), f.id);
  // aceita nome sem prefixo ("Maracujá")
  FLAVOR_BY_ANY.set(norm(f.name.replace(/^Vulc[aã]o\s+/i, "")), f.id);
}

const ADDON_BY_ANY = new Map<string, (typeof CATALOG.vulcao.addons)[number]["id"]>();
for (const a of CATALOG.vulcao.addons) {
  ADDON_BY_ANY.set(norm(a.id), a.id);
  ADDON_BY_ANY.set(norm(a.name), a.id);
}

const FILLING_BY_ANY = new Map<string, (typeof CATALOG.bolo10.fillings)[number]["id"]>();
for (const f of CATALOG.bolo10.fillings) {
  FILLING_BY_ANY.set(norm(f.id), f.id);
  FILLING_BY_ANY.set(norm(f.name), f.id);
}

function normalizeDeliveryMethod(v: unknown) {
  const x = norm(v);
  if (x === "entrega" || x === "retirada") return x;
  return v;
}

function normalizePaymentMethod(v: unknown) {
  const x = norm(v);
  if (x === "pix" || x === "dinheiro") return x;
  if (x === "cartao" || x === "cartao de credito" || x === "cartao de debito") return "cartao";
  return v;
}

function normalizeItems(items: unknown): unknown[] {
  if (!Array.isArray(items)) return [];
  return items.map((raw) => {
    if (!raw || typeof raw !== "object") return raw;
    const it: any = { ...(raw as any) };

    it.kind = norm(it.kind);

    if (it.kind === "vulcao") {
      it.flavorId = FLAVOR_BY_ANY.get(norm(it.flavorId)) ?? it.flavorId;
      it.massa = MASS_BY_ANY.get(norm(it.massa)) ?? it.massa;

      const addonsRaw: unknown[] = Array.isArray(it.addons) ? (it.addons as unknown[]) : [];

      it.addons = addonsRaw
        .map((a: unknown) => ADDON_BY_ANY.get(norm(a)) ?? a)
        .filter((a: unknown): a is string => typeof a === "string" && a.length > 0);

      it.qty = clampInt(it.qty, 1, 20, 1);
      return it;
    }

    if (it.kind === "bolo10") {
      it.massa = MASS_BY_ANY.get(norm(it.massa)) ?? it.massa;
      it.fillingId = FILLING_BY_ANY.get(norm(it.fillingId)) ?? it.fillingId;

      const topo = norm(it.topoType);
      if (topo === "nenhum" || topo === "simples" || topo === "personalizado") it.topoType = topo;

      it.qty = clampInt(it.qty, 1, 20, 1);
      return it;
    }

    return it;
  });
}

export async function POST(req: Request) {
  try {
    enforceOrigin(req);

    const ip = getIp(req);
    const rl = await rateLimit(`orders:${ip}`, 20, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 });
    }

    const body = await req.json();
    const normalized: any = (body && typeof body === "object") ? { ...body } : {};

    // normaliza strings vazias
    normalized.customerName = emptyToUndef(normalized.customerName);
    normalized.address = emptyToUndef(normalized.address);

    // normaliza enums “bonitos”
    normalized.deliveryMethod = normalizeDeliveryMethod(normalized.deliveryMethod);
    normalized.paymentMethod = normalizePaymentMethod(normalized.paymentMethod);

    // normaliza itens (aceita labels e converte pra ids)
    normalized.items = normalizeItems(normalized.items);

    // se não for entrega, remove endereço (evita min do schema)
    if (normalized.deliveryMethod !== "entrega") delete normalized.address;

    const parsed = orderRequestSchema.safeParse(normalized);
    if (!parsed.success) {
      // <-- aqui é a razão real do 400 (você consegue ver no Network->Response)
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

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

    return NextResponse.json({ orderCode: order.code, totalCents: order.totalCents, waUrl });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "Erro inesperado";
    const status = msg.includes("Origin not allowed") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
