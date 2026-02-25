# jc-premium-cakes (Next.js)

## Rodar local
1) Instale dependências:
```bash
pnpm install
# ou npm i / yarn
```

2) Configure o .env:
```bash
cp .env.example .env
```

3) **Upstash Redis (Opcional, para Rate Limiting em produção):**
   - Para habilitar o rate limiting distribuído, crie uma conta gratuita no [Upstash](https://upstash.com/).
   - Crie um banco de dados Redis e copie a `REST_URL` e `REST_TOKEN`.
   - Adicione-os ao seu `.env` (e à Vercel) como:
     ```
     UPSTASH_REDIS_REST_URL="https://..."
     UPSTASH_REDIS_REST_TOKEN="..."
     ```
   - Se não for configurado, o rate limiting funcionará de forma "dummy" (sem restrições) em desenvolvimento.

4) Prisma (SQLite):
```bash
pnpm prisma:generate
pnpm prisma:migrate
```

5) Rodar:
```bash
pnpm dev
```

## Fluxo
- Cliente monta pedido no front.
- Ao finalizar, o front chama `POST /api/orders`.
- O backend valida, calcula total oficial, gera código do pedido e devolve um link `wa.me` com mensagem pronta.
