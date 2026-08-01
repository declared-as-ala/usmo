# Architecture Audit — Current State vs Target

> Audited 2026-07-10 against the actual codebase (not the original spec).
> Cross-references: `NEXTSTEP.md` (repo root) for the pre-boutique gap list.

## 1. What exists today

### Stack (as built)

- **Next.js 16** (App Router) — note `AGENTS.md`: this version has breaking changes; consult
  `node_modules/next/dist/docs/` before using any API from memory.
- React 19, TypeScript (strict), Tailwind CSS v4 (`@theme` tokens in `src/app/globals.css`),
  Framer Motion, lucide-react.
- **No backend, no database, no auth.** Everything lives in `src/data/mockData.ts` (~1,140 lines)
  and is mutated in-memory via `src/context/AppContext.tsx` (~1,100 lines, `useState`). A refresh
  resets all state except `language`/`theme` (localStorage).

### Routing pattern

Every `src/app/**/page.tsx` is a thin `'use client'` wrapper rendering a view from
`src/views/*.tsx`. The admin area (`/admin/*`) has its own `layout.tsx` → `AdminShell`
(`src/components/Admin/`), and `SiteChrome.tsx` hides the public chrome on admin routes.
`AppContext` mirrors the route into an `activeScreen` union used for nav highlighting.

### Boutique-relevant code already present

| Area | Files | State |
|---|---|---|
| Shop landing | `src/views/OfficialCatalog.tsx` (606 lines) | Full premium landing: hero, new arrivals, collections, best sellers, matchday/limited banners, supporter packs, filterable grid (client-side chips + sort) |
| Product detail | `src/views/ProductDetail.tsx` (501) | Gallery, color/size selectors, 7-tab content, related products, mobile sticky ATC. **Color is presentation-only — never reaches the cart** |
| Product card | `src/components/Shop/ProductCard.tsx` | Premium card with badges, hover image |
| Cart drawer | inside `src/components/Common/AppLayout.tsx` | Sliding drawer, empty state, reservation messaging |
| Checkout | `src/views/Checkout.tsx` (587) | 3-step flow + animated confirmation with timeline. No coupon, no pickup-point selection, no delivery zones |
| Orders (admin) | `src/views/admin/AdminOrders.tsx` (204) | Table over in-memory orders; statuses only `pending / confirmed / cancelled` |
| Products (admin) | `src/views/admin/AdminBoutique.tsx` (353) | CRUD over in-memory `products` |
| Data model | `mockData.ts`: `CatalogItem` (trilingual name/description, `price: string`, sizes, colors, badges, collection, `stock?: number`, `reference`, seo fields); `AppContext`: `CartItem { product, size, quantity }`, `Order { id, clientName, phone, city, items, total, status, timestamp }` | Far simpler than target model — see gap table below |

### Non-boutique legacy (kept, not priority)

Public: Home, Football, Basketball, Matches, News, Media, Fan Zone, Sponsors, Stadium, Academy,
Press, History. Admin: Matches, Football, Basketball, News, Sponsors, Media, Academy, Press,
Fan Zone, Notifications, Settings, SEO, Pages, Users, Analytics — all CRUD over in-memory context
state. i18n: `translations` object inside `AppContext.tsx` (en/fr/ar), `dir=rtl` flip for Arabic.

## 2. What is missing (target vs current)

| Target requirement | Current state | Gap |
|---|---|---|
| MongoDB + Mongoose persistence | In-memory `useState` | **Everything** — no `mongoose` dependency, no connection, no models |
| Auth (Auth.js / secure custom) | Fake `login(email, role, name)` in context; `/admin` unprotected | Full auth system, session cookies, middleware protection |
| RBAC (6 roles, server-enforced) | Cosmetic role labels in Users admin | Real permission checks in every server action / route |
| Server actions / API routes | Zero server code besides static routes | Entire `src/server/**` layer |
| Zod validation | None (no zod dependency) | DTOs for every input |
| Product variants w/ per-variant stock | Flat `sizes: string[]`, optional single `stock` | Variant model (size×color), reserved vs available stock |
| Prices as numbers | `price: string` (e.g. `"129.000 DT"`) | Migrate to integer millimes; parsing/formatting layer |
| Order lifecycle (7 statuses, history, payment status) | 3 statuses, no history, no payment status, no reference format, no delivery method | Full order module |
| Pickup points / delivery zones | Nothing | New modules + checkout step |
| Coupons | Nothing | New module + server-side validation |
| Customers | Name/phone embedded per order | Customer collection keyed by phone |
| Order tracking page | Nothing | `/suivi` + lookup API |
| Customer accounts | Nothing (login modal removed earlier) | Optional accounts |
| Media uploads | URL-string fields only | Upload validation + storage (local `public/uploads` first, S3-compatible later) |
| Audit logs | In-memory, capped 50 | Persistent `auditlogs` collection |
| Rate limiting, security headers, CSRF | None | Security layer (see `security.md`) |
| Tests | None | See `testing.md` |
| SEO (`generateMetadata`, sitemap) | Static metadata in root layout only | Per-route metadata, sitemap, OG images |
| PWA manifest | None | Deferred (not boutique-critical) |

## 3. Risks & technical debt

1. **`'use client'` everywhere + context-as-database.** Every page is client-rendered from
   context; product data is bundled into the JS payload. Moving to server components fetching
   from MongoDB is a structural change, not a refactor. *Mitigation:* rebuild boutique routes as
   server components; leave legacy (football/news/fanzone) pages on context until later.
2. **`AppContext.tsx` is a 1,100-line god object** (i18n + theme + 15 admin domains + cart).
   *Mitigation:* extract a lean `CartProvider`/`WishlistProvider` (localStorage-persisted) for the
   boutique; do not grow AppContext further. i18n stays for now.
3. **`price: string`** — money as display strings invites float/parse bugs. *Mitigation:* store
   **integer millimes** (1 TND = 1000) in DB; single `formatTND()` utility.
4. **No variant identity.** Cart lines key on product+size only; color is lost. Target: cart lines
   reference a `variantId` (SKU-level).
5. **Broken hotlinked images** (club crests in matches data; logo history — see `NEXTSTEP.md` §1).
   Per project rule: **never commit an external image URL without curl-verifying it**. Boutique
   products must move to locally hosted/uploaded images anyway.
6. **Next.js 16 unfamiliarity** — APIs may differ from training data. Read
   `node_modules/next/dist/docs/` for: route handlers, server actions, `generateMetadata`,
   middleware, caching semantics, before writing each new kind of code.
7. **No test harness** — currently verification is "run `npm run dev` and click". Introduce
   vitest early (Phase 1) so services/validators are testable from the start.
8. **User rule: no deleting user code** — prefer additive edits; when a boutique page must be
   rebuilt, keep the old view file until the replacement is approved, then remove with consent.

## 4. Proposed architecture (this phase)

Full Next.js — **no NestJS now**, but a NestJS-extractable layering:

```
src/
  app/                      # Routes only (thin). Server components by default.
    (public)/               #   boutique, produit/[slug], panier, commande, suivi, contact, compte
    admin/                  #   admin app (protected by middleware + per-action RBAC)
    api/                    #   route handlers (auth, tracking, webhooks-later)
  server/                   # ← future NestJS boundary. Nothing here imports React.
    db/
      connect.ts            #   cached mongoose connection (serverless-safe)
      models/               #   mongoose schemas (User, Product, Order, ...)
    modules/<domain>/       #   products/, orders/, customers/, pickup-points/,
      <domain>.service.ts   #     business logic (pure, unit-testable)
      <domain>.repo.ts      #     data access (only place touching models)
      <domain>.dto.ts       #     zod schemas → inferred TS types
      <domain>.actions.ts   #     'use server' wrappers: auth check → validate → service
    lib/                    #   auth.ts, rbac.ts, rate-limit.ts, audit.ts, errors.ts, money.ts
  components/
    ui/                     #   shadcn-style primitives (button, input, dialog, sheet, ...)
    shop/                   #   product card, gallery, filters, cart drawer
    admin/                  #   tables, forms, stat cards (existing Admin/* migrates here)
  context/                  #   legacy AppContext (shrinking); new CartProvider
  views/                    #   legacy views (non-boutique) — untouched this phase
```

**Data flow rules**

- Route/page (server component) → `*.service.ts` for reads; client components call
  `*.actions.ts` (server actions) for mutations. No component ever imports a model directly.
- Every action: `requirePermission()` → zod parse → service → `audit()` → typed
  `Result<T, AppError>` return (no raw errors to client).
- Services never import `next/*` — that is what makes NestJS extraction mechanical
  (services/repos/DTOs copy over; actions become controllers).

**Coexistence strategy:** the boutique replaces its routes with the new DB-backed pages
(`/boutique`, `/produit`, `/panier`, `/commande`, `/suivi`, `/admin/boutique` → new admin
modules). Legacy sections keep running on AppContext until a later phase. The old
`products`/`orders` state in AppContext is retired only when the DB-backed boutique fully
replaces its consumers.

## 5. Dependencies to add

`mongoose`, `zod`, `next-auth@beta` (Auth.js v5) or custom JWT+cookie auth (decide Phase 1),
`bcryptjs`, `vitest` (+ `@vitest/ui`), `playwright` (E2E, later phase), optionally
`sharp` (image optimization on upload). UI primitives: shadcn/ui-style components implemented
in-repo on Tailwind v4 tokens (shadcn CLI compatibility with Tailwind v4/Next 16 to be verified
in Phase 1; if incompatible, hand-roll the ~10 primitives we need).
