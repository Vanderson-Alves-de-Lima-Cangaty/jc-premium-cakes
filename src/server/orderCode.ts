import { prisma } from "@/server/db";

function randomDigits(len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) out += Math.floor(Math.random() * 10).toString();
  return out;
}

export async function generateUniqueOrderCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `PJ-${randomDigits(6)}`;
    const exists = await prisma.order.findUnique({ where: { code } });
    if (!exists) return code;
  }
  // fallback
  return `PJ-${Date.now().toString().slice(-6)}`;
}
