/**
 * Sanitização simples para evitar caracteres de controle / invisíveis
 * e reduzir chance de textos "maliciosos" ou quebra de mensagem.
 */
export function sanitizeText(input: string, maxLen: number): string {
  const raw = (input ?? "").toString();

  // Remove caracteres de controle e "format" invisíveis
  const noControls = raw.replace(/[\p{C}]/gu, "");

  // Normaliza espaços
  const normalized = noControls.replace(/\s+/g, " ").trim();

  // Limita tamanho
  const clipped = normalized.slice(0, maxLen);

  // Permite letras (incl. acentos), números, espaços e pontuação básica
  const safe = clipped.replace(/[^a-zA-Z0-9À-ú\s!?.;:,@\-()\[\]#]/g, "");

  return safe.trim();
}
