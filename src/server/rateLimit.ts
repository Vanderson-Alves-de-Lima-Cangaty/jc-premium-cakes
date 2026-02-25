import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstash ? Redis.fromEnv() : null;

// Pega o tipo Duration direto do método (evita depender do nome exportado)
type Duration = Parameters<typeof Ratelimit.fixedWindow>[1];

// Cache por configuração (limit + window) para evitar recriar a cada request
const limiters = new Map<string, Ratelimit>();

function durationFromMs(ms: number): Duration {
  const sec = Math.max(1, Math.round(ms / 1000));

  // Preferir minutos quando der certinho
  if (sec % 60 === 0) {
    const m = sec / 60;
    return `${m} m` as Duration;
  }

  return `${sec} s` as Duration;
}

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const key = `${limit}:${windowMs}`;
  const existing = limiters.get(key);
  if (existing) return existing;

  if (!redis) throw new Error("Upstash Redis not configured");

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(limit, durationFromMs(windowMs)),
    prefix: "ratelimit",
    analytics: true
  });

  limiters.set(key, limiter);
  return limiter;
}

export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // Sem Upstash configurado: não bloqueia (útil local/dev)
  if (!redis) {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + windowMs
    };
  }

  // Se o Upstash cair ou der erro, melhor "fail-open" (não perder pedidos)
  try {
    const rl = getLimiter(limit, windowMs);
    const res = await rl.limit(identifier);
    return {
      success: res.success,
      limit: res.limit,
      remaining: res.remaining,
      reset: res.reset
    };
  } catch (err) {
    console.warn("[rateLimit] falhou (liberando request):", err);
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + windowMs
    };
  }
}
