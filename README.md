# 🍰 jc-premium-cakes

Production-ready web application for custom cake ordering with WhatsApp
checkout flow.

Built with modern full-stack architecture and designed for real-world
usage.

------------------------------------------------------------------------

## 🚀 Overview

**jc-premium-cakes** is a serverless ordering platform focused on:

-   Mini bolo vulcão customization\
-   Dynamic pricing logic\
-   Add-ons management\
-   Secure order validation\
-   WhatsApp-based checkout\
-   Production-ready API layer

This project is actively deployed and used in real customer
environments.

------------------------------------------------------------------------

## 🏗️ Tech Stack

### Frontend

-   Next.js (App Router)
-   TypeScript
-   TailwindCSS

### Backend

-   Next.js Route Handlers
-   Prisma ORM
-   Zod (schema validation)

### Database

-   PostgreSQL (Neon)

### Infrastructure

-   Vercel (Deployment)
-   Upstash Redis (Rate limiting)
-   Environment-based Origin validation

------------------------------------------------------------------------

## 🔐 Security & Production Safeguards

The application includes:

-   Server-side price calculation (single source of truth)
-   Zod schema validation for incoming orders
-   Rate limiting per IP
-   Input sanitization (anti-injection & formatting control)
-   Origin validation via `APP_ORIGIN`
-   Structured error handling
-   Persistent order storage

All critical calculations are executed server-side before order
finalization.

------------------------------------------------------------------------

## 🛒 Order Flow

1.  User selects:

    -   Cake type
    -   Topping
    -   Add-ons

2.  Cart calculates values locally (preview only)

3.  Frontend sends order payload to:

```{=html}
<!-- -->
```
    POST /api/orders

4.  Backend:
    -   Validates request schema
    -   Applies rate limiting
    -   Sanitizes user input
    -   Recalculates total price (server-side)
    -   Stores order in database
    -   Returns formatted WhatsApp URL
5.  User is redirected to WhatsApp with finalized message

------------------------------------------------------------------------

## ⚙️ Environment Variables

Required in production:

``` env
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
APP_ORIGIN=https://yourdomain.com
```

### Notes

-   `APP_ORIGIN` is enforced in production.
-   `.env` must never be committed.

------------------------------------------------------------------------

## 🧪 Development Setup

### 1️⃣ Clone repository

``` bash
git clone https://github.com/Vanderson-Alves-de-Lima-Cangaty/jc-premium-cakes
cd jc-premium-cakes
```

### 2️⃣ Install dependencies

``` bash
pnpm install
```

### 3️⃣ Configure environment

Create a `.env` file with required variables.

### 4️⃣ Prisma setup

``` bash
pnpm prisma generate
pnpm prisma migrate dev
```

### 5️⃣ Run locally

``` bash
pnpm dev
```

------------------------------------------------------------------------

## 🗄️ Database Strategy

-   Development: local PostgreSQL (recommended)
-   Production: Neon PostgreSQL

Orders are persisted with:

-   Unique order code\
-   Total stored in cents\
-   JSON payload snapshot

All totals are stored as integers (cents) to avoid floating point
precision issues.

------------------------------------------------------------------------

## 📈 Scalability Considerations

Current architecture supports:

-   Serverless execution\
-   Stateless API routes\
-   External rate limiting\
-   Cloud database\
-   Multi-instance deployment via Vercel

Future-ready for:

-   Multi-tenant architecture\
-   Admin dashboard\
-   Payment gateway integration\
-   Order status tracking\
-   Analytics layer

------------------------------------------------------------------------

## 🛡️ Operational Guidelines

-   Main branch protected\
-   No force push allowed\
-   Deploy triggered via push to `main`\
-   Production environment variables managed in Vercel

------------------------------------------------------------------------

## 📌 Project Status

✔ Production-ready\
✔ Used in real customer environment\
✔ Stable order pipeline\
✔ Zero critical incidents in production

------------------------------------------------------------------------

## 🧠 Philosophy

This project prioritizes:

-   Simplicity over complexity\
-   Validation over assumption\
-   Security over convenience\
-   Business logic centralized server-side

------------------------------------------------------------------------

## 📄 License

Create by Vanderson Cagaty
