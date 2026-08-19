# D'Amazon Cafe — Online Ordering Platform

A full-stack online ordering system for D'Amazon Cafe (Sungai Long, Cheras, Selangor): customer storefront with menu browsing, cart, checkout, and order tracking, plus an admin dashboard for managing orders, menu, promotions, delivery zones, and business settings. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and Drizzle ORM over SQLite.

This is a real, working application — not a static mockup. Pricing is calculated and validated server-side, admin sessions are signed JWTs in httpOnly cookies, passwords are hashed with bcrypt, and the payment integration is wired to a real gateway (Billplz) with a clearly-labeled demo mode for testing without a merchant account.

## Quick Start

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # then edit values as needed (see below)
npm run db:setup             # creates the SQLite schema and seeds menu/admin data
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin/login` for the admin dashboard.

**Default admin login:** `admin@damazoncafe.my` / the value of `SEED_ADMIN_PASSWORD` in your `.env.local` (defaults to `DAmazon@2026` in `.env.example`). Change this password from Admin → Settings, or by editing `SEED_ADMIN_PASSWORD` before running `db:setup`, before handing this over to real staff.

## Project Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint (project ships with zero errors/warnings) |
| `npm run db:push` | Push the Drizzle schema to the SQLite file |
| `npm run db:seed` | Seed categories, products, add-ons, delivery zones, and the admin user |
| `npm run db:setup` | `db:push` + `db:seed` in one step |

## Environment Variables

All variables are documented inline in `.env.example` — copy it to `.env.local` and adjust. The important ones:

- `DATABASE_URL` — SQLite file path. Defaults to `file:./data/damazon.db`, no external database required to run this out of the box.
- `ADMIN_SESSION_SECRET` — random secret used to sign admin session JWTs. Generate one with `openssl rand -base64 48` before deploying anywhere real.
- `SEED_ADMIN_PASSWORD` — only read by `npm run db:seed`, sets the initial admin password.
- `PAYMENT_MODE` — `demo` or `live` (see below).
- `BILLPLZ_API_KEY`, `BILLPLZ_COLLECTION_ID`, `BILLPLZ_X_SIGNATURE_KEY`, `BILLPLZ_BASE_URL` — only required when `PAYMENT_MODE=live`.
- `NEXT_PUBLIC_SITE_URL` — public base URL, used to build Billplz redirect/callback URLs.
- `WHATSAPP_NUMBER` — seed default for the WhatsApp contact button; editable later from Admin → Settings.

## Payments: Demo vs Live Mode

The payment gateway is Billplz (Malaysia's Ryt Bank / Billplz), the option you selected during scoping. The integration is a real adapter (`src/lib/billplz.ts`) that either simulates or calls the live Billplz REST API, controlled **only** by the `PAYMENT_MODE` environment variable:

- **`PAYMENT_MODE=demo`** (the shipped default) — no network call to Billplz is ever made. Checkout redirects to an in-app screen at `/payment/demo` that is clearly labeled **DEMO PAYMENT MODE**, with an explicit "no real payments are processed" disclaimer. The customer clicks a button to simulate success or failure, and the order transitions through the exact same status flow (received → payment confirmed → preparing → ...) that a real gateway would drive, so you can test and demo the entire ordering flow with zero setup.
- **`PAYMENT_MODE=live`** — checkout calls the real Billplz API to create a bill and redirects the customer to Billplz's hosted payment page. Orders are only marked as paid when Billplz's server-to-server webhook (`/api/payments/billplz/webhook`) posts a payment confirmation whose `X-Signature` has been verified with HMAC-SHA256 against `BILLPLZ_X_SIGNATURE_KEY` — never from the client-side redirect alone, which could otherwise be spoofed.

To go live: create a Billplz account, get your API key / collection ID / X-Signature key from the dashboard, set the four `BILLPLZ_*` variables and `PAYMENT_MODE=live` in your server's environment, and redeploy. **The payment mode and gateway credentials are intentionally not editable from the admin dashboard or stored in the database** — they only come from environment variables, so a compromised admin account or a stray API request can never silently switch the site into (or out of) live payments.

## Pricing & Order Integrity

The client never sends prices. The cart only sends product IDs, variant IDs, add-on IDs, and quantities; every price is looked up and recalculated server-side in `src/lib/pricing.ts` at order-creation time, including delivery fees by zone and discount code validation. Money is stored as integer "sen" (RM cents) throughout the schema and business logic to avoid floating-point rounding errors, and only formatted to RM with decimals at the UI layer.

## Database

The project ships with a local SQLite database (via `better-sqlite3` + Drizzle ORM) so it runs immediately with no external services. The full relational schema — categories, products, variants, add-ons, orders, order items, status history, payments, delivery zones, discount codes, admins, business settings, and favorites — lives in `src/lib/db/schema.ts`.

**A note on the stack:** the original scoping conversation selected Prisma as the ORM. While building, this sandboxed environment's network restrictions blocked Prisma's engine binary download (`binaries.prisma.sh` returned 403 Forbidden — the npm registry itself was reachable, but Prisma's separate binary CDN was not). Rather than ship a broken data layer, I substituted **Drizzle ORM**, which is pure-npm with no external binary download, and covers the same relational schema, migrations, and type-safe query capabilities Prisma would have. All the actual product requirements — server-side pricing, transactional order creation, relational integrity — work identically either way.

**Moving to Postgres / Supabase later:** Drizzle makes this a config change, not a rewrite. Swap `better-sqlite3` for `postgres` (or `@supabase/supabase-js` + `postgres.js`), change the dialect in `drizzle.config.ts` and `src/lib/db/index.ts` from `sqlite` to `postgresql`, adjust the few SQLite-specific column types in `schema.ts` (e.g. `integer({ mode: "timestamp" })` equivalents), and point `DATABASE_URL` at your Postgres connection string. The query layer (`src/lib/menu.ts`, `src/lib/order-service.ts`, etc.) uses Drizzle's query builder throughout and needs no changes.

## Deployment

This is a standard Next.js app and deploys anywhere Next.js runs (Vercel, a Node server, Docker, etc.). Two things to change before deploying for real:

1. Move off the local SQLite file to a hosted database (see above) — a serverless platform's filesystem is not durable storage for a file-based database.
2. Set `PAYMENT_MODE=live` with real Billplz credentials once you're ready to accept real payments (leave it on `demo` for staging/review).

Set all variables from `.env.example` in your hosting platform's environment variable settings — never commit `.env.local`.

## What's Included

- Customer storefront: home, full menu with 6 categories, product customization (variants, add-ons, special instructions), cart, 3-step checkout (pickup/delivery, customer details, review), demo/live payment, order confirmation, order tracking, printable receipt, About/Location/Contact, and legal pages (Terms, Privacy, Refund Policy, Payment Policy).
- Admin dashboard: login, sales/orders overview, order management with status workflow, menu management (products, add-ons, categories, sold-out toggling), promotions/discount codes, delivery zones, and business settings (hours, contact info, tax/service charge, payment mode status).
- SEO: per-page metadata, Open Graph tags, LocalBusiness/Restaurant structured data (JSON-LD), `sitemap.xml`, `robots.txt`.
- Mobile-first responsive design with a sticky mobile ordering bar, and animations that respect `prefers-reduced-motion`.
