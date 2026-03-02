# 🍰 jc-premium-cakes

Production-ready web application for custom cake ordering with WhatsApp checkout flow.

Built with modern full-stack architecture and designed for real-world usage.

---

## 🚀 Overview

**jc-premium-cakes** is a serverless ordering platform focused on:

- Mini bolo vulcão customization
- Dynamic pricing logic
- Add-ons management
- Secure order validation
- WhatsApp-based checkout
- Production-ready API layer

This project is actively deployed and used in real customer environments.

---

## 🏗️ Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- TailwindCSS

### Backend
- Next.js Route Handlers
- Prisma ORM
- Zod (schema validation)

### Database
- PostgreSQL (Neon)

### Infrastructure
- Vercel (Deployment)
- Upstash Redis (Rate limiting)
- Origin validation via `APP_ORIGIN`

---

## 🔐 Security & Production Safeguards

This application includes:

- Server-side price calculation (single source of truth)
- Zod schema validation
- Rate limiting per IP
- Input sanitization
- Origin validation
- Structured error handling
- Persistent order storage

All critical calculations are executed server-side before order finalization.

---

## 🛒 Order Flow

1. User selects:
   - Cake type
   - Topping
   - Add-ons

2. Cart calculates values locally (preview only).

3. Frontend sends payload to:

    POST /api/orders

4. Backend:
   - Validates schema
   - Applies rate limiting
   - Sanitizes inputs
   - Recalculates total server-side
   - Stores order in database
   - Returns WhatsApp redirect URL

5. User is redirected to WhatsApp with finalized order message.

---

## ⚙️ Environment Variables

Required in production:

    DATABASE_URL=
    UPSTASH_REDIS_REST_URL=
    UPSTASH_REDIS_REST_TOKEN=
    APP_ORIGIN=https://yourdomain.com

Notes:

- `APP_ORIGIN` is enforced in production.
- `.env` must never be committed.

---

## 🧪 Development Setup

### Clone repository

    git clone https://github.com/Vanderson-Alves-de-Lima-Cangaty/jc-premium-cakes
    cd jc-premium-cakes

### Install dependencies

    pnpm install

### Prisma

    pnpm prisma generate
    pnpm prisma migrate dev

### Run locally

    pnpm dev

---

## 🗄️ Database Strategy

- Development: local PostgreSQL
- Production: Neon PostgreSQL

Orders persist:

- Unique order code
- Total in cents (integer format)
- JSON snapshot of payload

All totals are stored in cents to prevent floating point precision issues.

---

## 📈 Scalability

Current architecture supports:

- Serverless execution
- Stateless API routes
- External rate limiting
- Cloud-managed database
- Multi-instance deployment via Vercel

Future-ready for:

- Multi-tenant architecture
- Admin dashboard
- Payment gateway integration
- Order tracking
- Analytics layer

---

## 🛡️ Operational Guidelines

- `main` branch protected
- No force push
- Deploy triggered via push to `main`
- Production environment variables managed in Vercel

---

## 📌 Project Status

✔ Production-ready  
✔ Actively used  
✔ Stable order pipeline  
✔ No critical production incidents  

---

## 📄 License

Created by Vanderson Cagaty.
