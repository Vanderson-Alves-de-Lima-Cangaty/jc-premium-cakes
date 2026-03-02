import { z } from "zod";

const isServer = typeof window === "undefined";

const envSchema = z.object({
  // Servidor (Privadas)
  DATABASE_URL: isServer ? z.string().url() : z.any(),
  UPSTASH_REDIS_REST_URL: isServer ? z.string().url().optional() : z.any(),
  UPSTASH_REDIS_REST_TOKEN: isServer ? z.string().optional() : z.any(),
  APP_ORIGIN: isServer ? z.string().url().optional() : z.any(),
  
  // Públicas (Client + Server)
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().min(10).default("5569993471428"),
  NEXT_PUBLIC_DELIVERY_FEE_CENTS: z.coerce.number().default(500),
  NEXT_PUBLIC_PROMO_FREE_DELIVERY: z.preprocess(
    (val) => val === "true" || val === "1" || val === true,
    z.boolean()
  ).default(true),
});

// Validação em tempo de execução
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Erro nas Variáveis de Ambiente:", parsed.error.flatten().fieldErrors);
  // Em build/produção, lançamos erro para travar o deploy quebrado
  if (process.env.NODE_ENV === "production") {
    throw new Error("Variáveis de ambiente inválidas.");
  }
}

export const env = parsed.success ? parsed.data : ({} as z.infer<typeof envSchema>);
