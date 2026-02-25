import { NextResponse } from "next/server";
import { orderRequestSchema } from "@/shared/validation/orderRequest";
import { computeTotalsCents, type CartItem } from "@/server/pricing";
import { buildWhatsappMessage } from "@/server/message";
import { getWhatsappNumber, CATALOG } from "@/server/catalog";
import { prisma } from "@/server/db";
import { generateUniqueOrderCode } from "@/server/orderCode";
import { sanitizeText } from "@/lib/sanitize";
import { rateLimit } from "@/server/rateLimit";
import { normalizeOrderPayload, normalizeTextKey } from "@/server/orderPayload";

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

const MASS_BY_ANY = new Map<string, (typeof CATALOG.masses)[number]["id"]>([
  ["branca", "branca"],
  ["massa branca", "branca"],
  ["chocolate", "chocolate"],
  ["massa chocolate", "chocolate"],
  ["morango", "morango"],
  ["massa morango", "morango"]
]);

const FLAVOR_BY_ANY = new Map<string, (typeof CATALOG.vulcao.flavors)[number]["id"]>();
for (const f of CATALOG.vulcao.flavors) {
  FLAVOR_BY_ANY.set(normalizeTextKey(f.id), f.id);
  FLAVOR_BY_ANY.set(normalizeTextKey(f.name), f.id);
  FLAVOR_BY_ANY.set(normalizeTextKey(f.name.replace(/^Vulc[aã]o\s+/i, "")), f.id);
}

const ADDON_BY_ANY = new Map<string, (typeof CATALOG.vulcao.addons)[number]["id"]>();
for (const a of CATALOG.vulcao.addons) {
  ADDON_BY_ANY.set(normalizeTextKey(a.id), a.id);
  ADDON_BY_ANY.set(normalizeTextKey(a.name), a.id);
}

const FILLING_BY_ANY = new Map<string, (typeof CATALOG.bolo10.fillings)[number]["id"]>();
for (const f of CATALOG.bolo10.fillings) {
  FILLING_BY_ANY.set(normalizeTextKey(f.id), f.id);
  FILLING_BY_ANY.set(normalizeTextKey(f.name), f.id);
}

function normalizeQty(value: unknown): number {
  const num = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(num)) return 1;
  return Math.max(1, Math.min(20, Math.floor(num)));
}

function normalizeItems(items: unknown): unknown[] {
  if (!Array.isArray(items)) return [];

  return items.map((raw) => {
    if (!raw || typeof raw !== "object") return raw;
    const it: Record<string, unknown> = { ...(raw as Record<string, unknown>) };

    const kindNorm = normalizeTextKey(it.kind);
    const hasVulcaoShape = typeof it.flavorId === "string" || Array.isArray(it.addons);
    const hasBoloShape = typeof it.fillingId === "string" || typeof it.topoType === "string";

    let inferredKind: "vulcao" | "bolo10" | undefined;
    if (kindNorm === "vulcao" || kindNorm === "bolo10") {
      inferredKind = kindNorm;
    } else if (hasVulcaoShape !== hasBoloShape) {
      inferredKind = hasVulcaoShape ? "vulcao" : "bolo10";
    }

    if (!inferredKind) {
      return it;
    }

    it.kind = inferredKind;

    if (inferredKind === "vulcao") {
      it.flavorId = FLAVOR_BY_ANY.get(normalizeTextKey(it.flavorId)) ?? it.flavorId;
      it.massa = MASS_BY_ANY.get(normalizeTextKey(it.massa)) ?? it.massa;

      const addonsRaw: unknown[] = Array.isArray(it.addons) ? it.addons : [];
      const deduped: unknown[] = [];
      const seen = new Set<string>();

      for (const addonRaw of addonsRaw) {
        const mappedAddon = ADDON_BY_ANY.get(normalizeTextKey(addonRaw)) ?? addonRaw;
        if (typeof mappedAddon === "string") {
          if (seen.has(mappedAddon)) continue;
          seen.add(mappedAddon);
        }
        deduped.push(mappedAddon);
      }

      it.addons = deduped;
      it.qty = normalizeQty(it.qty);
      return it;
    }

    it.massa = MASS_BY_ANY.get(normalizeTextKey(it.massa)) ?? it.massa;
    it.fillingId = FILLING_BY_ANY.get(normalizeTextKey(it.fillingId)) ?? it.fillingId;

    const topo = normalizeTextKey(it.topoType);
    if (topo === "nenhum" || topo === "simples" || topo === "personalizado") {
      it.topoType = topo;
    }

    it.qty = normalizeQty(it.qty);
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
    const normalized = normalizeOrderPayload(body);
    normalized.items = normalizeItems(normalized.items);

    const parsed = orderRequestSchema.safeParse(normalized);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    if (data.deliveryMethod === "retirada") {
      data.address = undefined;
    }

    const items = data.items as unknown as CartItem[];

    const customerName = sanitizeText(data.customerName ?? "", 50);
    const address = data.deliveryMethod === "entrega" ? sanitizeText(data.address ?? "", 200) : "";

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
