# Implementation Roadmap

> Phases map to the required plan; each phase is split into small, verifiable batches
> (a batch = one working increment, ends with `tsc --noEmit` clean + a manual click-through +
> a `progress.md` update). Never break existing pages; legacy (non-boutique) sections keep
> running on AppContext throughout.

## Phase 1 — Foundation & docs ✅(docs) / 🔜(foundation)

**1.1 Docs** — this `/docs` set. *(done 2026-07-10)*
**1.2 Toolchain:** add `mongoose`, `zod`, `bcryptjs`, `vitest`; `npm run typecheck`, `test`,
`seed` scripts; `.env.example` + env validation; read `node_modules/next/dist/docs/` notes for
server actions / route handlers / middleware / `generateMetadata` (Next 16 specifics) and record
findings in `progress.md`.
**1.3 Server skeleton:** `src/server/{db,lib,modules}` layout, cached Mongo connection,
`Result`/`AppError`, `money.ts` (millimes + `formatTND`), audit helper, rate limiter, `rbac.ts`.
**1.4 Auth:** Auth.js v5 credentials (admin), session cookies, middleware protecting `/admin`,
login page at `/admin/login`, lockout counters, audit `auth.*`. Decision point: confirm Auth.js
beta works cleanly with Next 16; fallback = minimal custom JWT-cookie auth behind the same
`getSession()` interface.
**1.5 UI primitives:** `src/components/ui/*` (button, input, select, dialog, sheet, drawer,
tabs, badge, chip, skeleton, toast, table, stepper) on the token set from `ui-ux.md`; verify
shadcn CLI vs hand-rolled (record decision).
**Exit:** admin can log in/out against a seeded SUPER_ADMIN in MongoDB; unit tests for money,
rbac, rate limiter green.

## Phase 2 — Product catalog (DB-backed)

**2.1 Models + seed:** users, categories, collections, products, productvariants, settings,
media, auditlogs; seed script per `database.md` §5 (local images only).
**2.2 Services/actions:** products, categories, collections modules (CRUD + public queries).
**2.3 Admin:** Products list + tabbed form (variants matrix), Categories, Collections,
Media Library (upload pipeline).
**2.4 Public:** rebuild `/boutique` (server components, URL filters, sort, pagination,
skeletons, empty states), category routes `/boutique/[categorie]`, PDP `/produit/[slug]`
(variant-true selection), `generateMetadata` for all three.
**Exit:** an admin-created product with variants is browsable, filterable, and viewable
publicly; old mock-product pages replaced; integration tests for product queries green.

## Phase 3 — Cart & checkout

**3.1 CartProvider** (localStorage, variantId-based) + `validateCart`; new cart drawer + `/panier`
page; retire AppContext cart for boutique routes.
**3.2 Checkout scaffolding:** pickup points + delivery zones models, seeds, admin CRUD
(G/H pages), `getActivePickupPoints`, `getDeliveryQuote`.
**3.3 Checkout flow `/commande`:** 4 steps per `ecommerce.md` §4, shared zod DTOs, both
delivery paths.
**3.4 `createOrder`** full pipeline (customer upsert, reference, PENDING, snapshots,
notifications stub, idempotency) + confirmation screen.
**Exit:** E2E: browse → cart → both checkout paths → PENDING order in DB; tampered-price
integration tests green.

## Phase 4 — Order management

**4.1 Admin Orders:** table with status tabs/filters/search/export + order detail page
(contact buttons, notes, payment status).
**4.2 Status machine:** `updateOrderStatus` with transition table, history, stock
reserve/decrement/restore (+ `stockmovements`), idempotency, audit.
**4.3 Tracking:** `/suivi` + `GET /api/orders/track` (rate-limited, safe projection).
**4.4 Emails:** Mailer interface + order received/confirmed/cancelled/shipped templates
(console driver in dev).
**Exit:** full lifecycle E2E (client order → admin confirm→…→delivered → client tracks) green;
old AdminOrders/AppContext orders retired.

## Phase 5 — Admin dashboard completion

**5.1 Dashboard home** widgets (`getDashboardStats`).
**5.2 Customers** module (list, profile, notes, block).
**5.3 Users & Roles** (CRUD, generated permission matrix, last-SUPER_ADMIN guard) + per-action
RBAC audit across all existing actions.
**5.4 Settings** page (all sections incl. WhatsApp number wired into every CTA) +
**Audit Logs** viewer.
**Exit:** all six roles exercised in E2E (ANALYST cannot mutate); settings drive public chrome.

## Phase 6 — Stock, coupons, pickup polish

**6.1 Inventory module:** overview, adjust-with-reason, movement ledger, low-stock alerts,
CSV export.
**6.2 Coupons:** model, admin CRUD + stats, `previewCoupon`, checkout integration,
redemption limits.
**6.3 Pickup/delivery polish:** hours structure, availability badges, deactivation guards,
zone bulk-seed for 24 governorates.
**6.4 Notifications:** in-app admin notifications (new order, low stock), customer notification
list.
**Exit:** coupon + inventory integration/E2E tests green; stock rule (create ≠ decrement,
confirm = decrement, cancel = restore) proven.

## Phase 7 — UI/UX polish & content

**7.1 Home page rebuild** (boutique-first hero + all sections from spec §3A).
**7.2 Wishlist** (guest + account) + recently viewed + related/frequently-bought strips.
**7.3 Customer accounts** (register/login, profile, addresses, order history, saved sizes).
**7.4 Pages admin + public content pages** (contact, FAQ, terms, delivery/pickup info) +
**SEO module** (overview, defaults, sitemap, redirects).
**7.5 Motion & a11y pass** per `ui-ux.md` §5/§7; dark mode + RTL sweep; real club logo into
`public/brand/` (ask user for the file — known landmine).
**Exit:** manual checklist (testing.md §5) fully green.

## Phase 8 — Security, testing, production readiness

**8.1 Security test pass** (testing.md §4) + headers/CSP + rate-limit tuning.
**8.2 Full E2E matrix + Lighthouse** (mobile ≥ 90 on `/boutique`, PDP).
**8.3 Ops:** production env docs, seed rotation, backup/restore drill, deployment guide
(Vercel or VPS + Mongo Atlas), `next build` verification, error monitoring hook.
**8.4 Release:** acceptance criteria sign-off against `product-specification.md` §8.

## Standing decisions & open questions

| # | Question | Default until answered |
|---|---|---|
| D1 | Auth.js v5 vs custom auth on Next 16 | Try Auth.js first (1.4) |
| D2 | shadcn CLI vs hand-rolled primitives on Tailwind v4 | Verify in 1.5 |
| D3 | Blue token `#0057FF` vs existing `#0D63FF` | Sample the real logo when the user provides it |
| D4 | `stock.decrementOn` default | `confirm` |
| D5 | Image storage | Local `public/uploads` now, adapter interface for S3 later |
| D6 | Hosting target | Needed by Phase 8 (affects rate-limiter store & uploads persistence) |
| D7 | Real USM logo file | **Blocked on user** — needed Phase 7 |
