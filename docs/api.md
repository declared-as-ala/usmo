# API Surface — Server Actions & Route Handlers

> Convention: **mutations are Server Actions** (`src/server/modules/<domain>/<domain>.actions.ts`,
> `'use server'`); **reads for server components are service calls** (no HTTP hop); **route
> handlers** (`src/app/api/**`) exist only where a real HTTP endpoint is needed (auth callbacks,
> public tracking lookup, uploads, future webhooks/mobile).
>
> Every action follows the same pipeline:
> `rate-limit (where flagged) → auth/permission check → zod parse (DTO) → service → audit log → Result<T, AppError>`.
> Errors return `{ ok: false, error: { code, message } }` — safe messages only, no stack traces.
> All list actions accept `{ page, limit (≤100), sort, filters }` and return
> `{ items, total, page, pages }`.

Permission legend: 🌐 public · 👤 customer session · 🔑 admin (specific permission in
parentheses, see `security.md` §RBAC).

## Auth

| Endpoint / action | Type | Access | Notes |
|---|---|---|---|
| `POST /api/auth/[...nextauth]` | route | 🌐 | Auth.js credentials provider(s): `admin-login` (users) and `customer-login` (customers). Rate-limited, lockout after 5 failures |
| `adminLogin / adminLogout` | via Auth.js | 🌐 | Session = HTTP-only secure cookie (JWT strategy). Audit `auth.login` / `auth.logout` |
| `registerCustomer(dto)` | action | 🌐 rate-limited | name, phone (unique), email?, password. Normalizes phone; merges existing guest customer record |
| `changePassword(dto)` | action | 👤/🔑 | requires current password |
| `getSession()` | helper | — | server-side session accessor used by layouts/middleware |

## Users & Roles (admin staff)

| Action | Access | Notes |
|---|---|---|
| `listUsers`, `getUser(id)` | 🔑 (users.view) | never returns passwordHash |
| `createUser(dto)` | 🔑 (users.manage — SUPER_ADMIN) | role from enum; temp password; audit `user.create` |
| `updateUser(id, dto)` / `setUserRole(id, role)` | 🔑 (users.manage) | cannot demote the last SUPER_ADMIN; audit `user.role.change` |
| `deactivateUser(id)` | 🔑 (users.manage) | soft; invalidates sessions |

## Products

| Action | Access | Notes |
|---|---|---|
| `getPublishedProducts(filterDto)` | 🌐 service | filters: category, collection, size, color, price range, availability, badges, gender, ageGroup, search; sorts: newest, popular, price asc/desc, best-sellers, promo |
| `getProductBySlug(slug)` | 🌐 service | PUBLISHED only; increments `stats.views` (fire-and-forget) |
| `getRelatedProducts(id)` | 🌐 service | manual `relatedProducts` → fallback same collection/category |
| `listProductsAdmin(filterDto)` | 🔑 (products.view) | includes drafts/archived, stock rollup |
| `createProduct(dto)` / `updateProduct(id, dto)` | 🔑 (products.edit) | slug/SKU uniqueness; sanitized rich text; audit |
| `setProductStatus(id, status)` | 🔑 (products.publish) | DRAFT/PUBLISHED/ARCHIVED |
| `deleteProduct(id)` | 🔑 (products.delete) | blocked if referenced by orders → archive instead |
| `createVariant / updateVariant / deactivateVariant` | 🔑 (products.edit) | SKU unique; stock fields not writable here (use inventory) |

## Categories & Collections

CRUD pairs, same pattern: `listCategories`/`listCollections` (🌐 service for active,
🔑 admin for all), `create/update/delete` (🔑 content.edit or products.edit). Delete blocked while
products reference them; reorder via `displayOrder` batch action.

## Cart

Guest cart is client state (localStorage) — the server never trusts it; it is re-validated at
checkout. Server endpoints exist only for logged-in sync and validation:

| Action | Access | Notes |
|---|---|---|
| `validateCart(items[])` | 🌐 | input `[{ variantId, quantity }]`; returns authoritative `{ unitPrice, name, image, available, maxQty }` per line + subtotal. Used by cart page & checkout step 0 |
| `syncCart(items[])` / `getCart()` | 👤 | persists customer cart |

## Coupons (public-facing)

| Action | Access | Notes |
|---|---|---|
| `previewCoupon({ code, items, phone? })` | 🌐 rate-limited | full server validation (active, window, min order, limits, eligibility); returns discount amount or typed error (`COUPON_INVALID`, `COUPON_EXPIRED`, `COUPON_MIN_ORDER`, …). Never reveals coupon internals |

## Checkout & Orders

| Action | Access | Notes |
|---|---|---|
| `getActivePickupPoints()` | 🌐 service | active only, ordered |
| `getDeliveryQuote({ governorate, city, subtotal })` | 🌐 | zone lookup, free-threshold applied; `NO_ZONE` error if unserved |
| `createOrder(dto)` | 🌐 **rate-limited (3/min/IP + phone)** | THE critical action. Input: items `[{variantId, qty}]`, customer info, deliveryMethod + address XOR pickupPointId, couponCode?, notes, termsAccepted. Server: re-fetch prices, validate stock/pickup/zone/coupon, compute totals, upsert customer by phone, generate reference, create `PENDING` order, optional reserve stock (per settings), redemption record, notify admins, email customer if email. Returns `{ reference, total, timeline }` |
| `GET /api/orders/track?ref=&phone=` | route | 🌐 rate-limited | both must match; returns public-safe projection (status, timeline, items snapshot, delivery info, customerVisibleNote). 404 indistinguishable for bad ref vs bad phone |
| `listMyOrders()` / `getMyOrder(ref)` | 👤 | by session customer |

## Orders (admin)

| Action | Access | Notes |
|---|---|---|
| `listOrdersAdmin(filterDto)` | 🔑 (orders.view) | filters: status, date range, city, method, pickup point, payment status, amount range, product, search (ref/phone/name/email) |
| `getOrderAdmin(id)` | 🔑 (orders.view) | full detail incl. adminNotes, history, audit trail |
| `updateOrderStatus(id, { status, note?, notify? })` | 🔑 (orders.confirm for CONFIRMED/CANCELLED; orders.edit for others) | validates transition table; stock reserve/decrement/restore side-effects (idempotent via `stockApplied`); appends statusHistory; audit `order.status.*`; optional customer email |
| `setPaymentStatus(id, status)` | 🔑 (orders.edit) | audit |
| `updateOrderNotes(id, { adminNotes?, customerVisibleNote? })` | 🔑 (orders.edit) | |
| `exportOrders(filterDto)` | 🔑 (orders.export) | CSV stream |

## Customers (admin)

`listCustomers(filterDto)`, `getCustomer(id)` (with orders, notes, communication log),
`updateCustomer(id, dto)`, `addCustomerNote(id, note)`, `setCustomerStatus(id, ACTIVE|BLOCKED)` —
🔑 (customers.view / customers.edit). Export CSV under customers.export.

## Pickup Points & Delivery Zones (admin)

CRUD: `create/update/delete PickupPoint`, `togglePickupPointActive`, reorder;
`create/update/delete DeliveryZone`, bulk-import zones. 🔑 (logistics.manage). Delete of a pickup
point referenced by non-terminal orders is blocked → deactivate instead. All audited.

## Inventory

| Action | Access | Notes |
|---|---|---|
| `getInventoryOverview(filterDto)` | 🔑 (inventory.view) | per product/variant: onHand, reserved, available, threshold flags |
| `adjustStock({ variantId, delta, reason })` | 🔑 (inventory.adjust) | atomic `$inc` with floor-0 guard; writes stockmovements + audit |
| `listStockMovements(variantId | filters)` | 🔑 (inventory.view) | ledger |
| `exportStockCsv()` | 🔑 (inventory.view) | |

## Coupons (admin)

`listCoupons`, `createCoupon(dto)`, `updateCoupon(id, dto)`, `toggleCouponActive(id)`,
`getCouponStats(id)` (usage, revenue impact) — 🔑 (coupons.manage). Code auto-uppercased, unique.

## Media

| Endpoint / action | Access | Notes |
|---|---|---|
| `POST /api/admin/media/upload` | route 🔑 (media.manage) | multipart; validates mime (jpeg/png/webp/avif), size ≤ 5MB, re-encodes via sharp (strips EXIF), stores `public/uploads/<folder>/<uuid>.webp`; storage adapter interface so S3 can replace local later |
| `listMedia(folder)`, `updateMediaAlt`, `moveMedia`, `deleteMedia` | 🔑 (media.manage) | delete warns/blocks when `usedBy` non-empty |

## Pages & SEO

`getPage(slug)` (🌐 service), `listPagesAdmin`, `updatePage(slug, dto)` (🔑 content.edit,
sanitized blocks), `updateSeo(entityType, id, seoDto)` (🔑 content.edit),
`listSeoIssues()` (🔑 — entities missing title/description), `GET /sitemap.xml` +
`GET /robots.txt` via Next metadata routes, `listRedirects/createRedirect` (🔑 content.edit).

## Analytics (admin)

`getDashboardStats(range)` — order counts by status, revenue (sum of non-cancelled totals),
top products, low/out-of-stock, recent orders, customers by city, category performance,
coupon usage. `getOrdersTimeSeries(range, granularity)`, `getProductPerformance(range)`
(views vs ordered = conversion), `getCartAbandonment(range)` (best-effort: validateCart calls vs
orders). All 🔑 (analytics.view), aggregation-pipeline backed, no PII in exports.

## Settings

`getSettings()` (server-cached; public subset exposed via `getPublicSettings()` for
header/footer/WhatsApp), `updateSettings(dto)` — 🔑 (settings.manage, SUPER_ADMIN +
BOUTIQUE_MANAGER). Audit with before/after diff.

## Notifications

`listMyNotifications()`, `markNotificationRead(id)` (🔑/👤 own only);
system-generated: order created → admins with orders.view; low stock (threshold crossing) →
inventory managers; order status → customer (in-app if account, email if address).

## Audit Logs

`listAuditLogs(filterDto)` — 🔑 (audit.view, SUPER_ADMIN + ANALYST read-only). Filters: actor,
action prefix, entity, date range. Read-only — no mutation API exists by design.

## Fan Accounts, Membership, Fan Zone, Media Access & Donations

> Implemented as real NestJS controllers under `apps/api/src/modules/*` — see
> `fan-membership.md` for the full behavioral spec and `database.md`'s matching section for
> schemas. Access legend here reuses 🌐/👤/🔑 plus two new markers: 🧑‍🤝‍🧑 **any logged-in fan**
> (`JwtAuthGuard` only, any role) and ⭐ **active member** (`JwtAuthGuard` + a new
> `RequireActiveMembership` guard). All endpoints sit under the existing global `/api` prefix.

### Auth additions

| Endpoint | Access | Notes |
|---|---|---|
| `POST /api/auth/register` | 🌐 **throttled** (wire `ThrottlerModule`, currently unused despite being installed) | creates a `role: 'Fan'` user via the existing `UsersService.create` (bcrypt hashing already lives there); rejects duplicate email |
| `GET /api/me` | 🧑‍🤝‍🧑 | **DB-backed**, unlike the existing `GET /api/auth/me` which only decodes the JWT payload — returns the fresh user document (minus password) + a `membershipSummary` (active y/n, plan name, daysRemaining) |
| `PATCH /api/me/profile` | 🧑‍🤝‍🧑 | whitelisted fields only (matches `ValidationPipe`'s `forbidNonWhitelisted: true` — DTO must declare every accepted field) |
| `PATCH /api/me/privacy` | 🧑‍🤝‍🧑 | updates `privacySettings` |
| `POST /api/me/avatar` | 🧑‍🤝‍🧑 | multipart upload; internally calls the exported `StorageService.uploadFile` (folder `users/avatars`) — **read the uploader id from `req.user.sub`, not `req.user.userId`** (existing bug in the admin storage controller — do not repeat it) |

### Membership

| Endpoint | Access | Notes |
|---|---|---|
| `GET /api/membership/plans` | 🌐 | active plans only, ordered |
| `GET /api/me/membership` | 🧑‍🤝‍🧑 | current/most-recent membership + computed `daysRemaining`/`renewalCta`; lazily flips `active` → `expired` here if `endDate` has passed |
| `POST /api/me/membership/request` | 🧑‍🤝‍🧑 | body `{ planId }`; creates a `pending` membership; a fan with an existing `pending` request cannot create another (`MEMBERSHIP_REQUEST_ALREADY_PENDING`) |
| `GET /api/admin/membership-plans` | 🔑 `Admin, Super Admin` | |
| `POST /api/admin/membership-plans` | 🔑 same | |
| `PATCH /api/admin/membership-plans/:id` | 🔑 same | |
| `DELETE /api/admin/membership-plans/:id` | 🔑 `Super Admin` | mirrors the Orders module's delete-restricted-to-Super-Admin pattern |
| `GET /api/admin/memberships` | 🔑 `Admin, Super Admin` | filters: status, planId, search (name/email) |
| `PATCH /api/admin/memberships/:id/approve` | 🔑 same | body `{ startDate, endDate, note? }`; **server-enforces** the transition table in `fan-membership.md` §2 (unlike Orders, which leaves transition logic to the frontend) |
| `PATCH /api/admin/memberships/:id/reject` | 🔑 same | |
| `PATCH /api/admin/memberships/:id/renew` | 🔑 same | creates a new membership doc with `renewedFrom` set |
| `PATCH /api/admin/memberships/:id/suspend` | 🔑 same | |
| `PATCH /api/admin/memberships/:id/cancel` | 🔑 same | |

### Fan Zone (minimal backend core — see non-goals in `fan-membership.md` §6 for what's NOT here)

| Endpoint | Access | Notes |
|---|---|---|
| `GET /api/fan-zone/dashboard` | 🧑‍🤝‍🧑 | returns points total (from `fanpoints` ledger) + membership summary; full interactive sections still require ⭐ |
| `GET /api/fan-zone/votes/active` | 🌐 | returns the current active poll (or `null`) with vote counts if `isActive` — public so the teaser can render a sample |
| `POST /api/fan-zone/votes/:id/vote` | ⭐ | body `{ optionKey }`; one vote per fan per poll (unique index enforced) |
| `GET /api/fan-zone/ranking` | 🧑‍🤝‍🧑 | aggregated from `fanpoints`, filters out rows where `privacySettings.showRanking === false` before assigning display rank |

### Media (public teaser + gated detail)

| Endpoint | Access | Notes |
|---|---|---|
| `GET /api/media/albums` | 🌐 (optional auth) | returns all published albums; `registered`/`members` items the caller can't access come back with `locked: true` and `photos` stripped — see teaser shape in `fan-membership.md` §4 |
| `GET /api/media/albums/:slug` | 🌐 (optional auth) | same locked-teaser behavior, never a hard 403/404 for an existing-but-locked slug |
| `GET /api/media/videos` / `GET /api/media/videos/:slug` | 🌐 (optional auth) | same pattern |
| `GET /api/admin/media/albums` / `videos` | 🔑 `Admin, Super Admin` | full CRUD, incl. drafts |
| `POST` / `PATCH /api/admin/media/albums/:id` (and `videos`) | 🔑 same | includes `accessLevel` field |
| `DELETE /api/admin/media/albums/:id` (and `videos`) | 🔑 `Super Admin` | |

Note the "optional auth" guard is a **new** `OptionalJwtAuthGuard` — do not reuse `JwtAuthGuard`
as-is (it throws `401` on a missing/invalid token; these endpoints must succeed for anonymous
visitors and just render the locked-teaser branch).

### Donations

| Endpoint | Access | Notes |
|---|---|---|
| `GET /api/donations/settings` | 🌐 | public subset only (suggested amounts, purposes, bank instructions, proofRequired) — never leaks admin-only threshold config beyond what the donation form needs |
| `POST /api/donations` | 🧑‍🤝‍🧑 **throttled** | body: amount, purpose, method, message?, displayNameMode, showAmount; amount validated server-side against `donationsettings.minAmount` — **never trust a client-sent status**, always created `pending` |
| `POST /api/donations/:id/proof` | 🧑‍🤝‍🧑 | multipart upload for own pending donation only; internally calls `StorageService.uploadFile` (new folder — add `DONATIONS = 'donations'` to `FOLDERS` in `upload.constants.ts`) |
| `GET /api/me/donations` | 🧑‍🤝‍🧑 | own donation history, all statuses |
| `GET /api/donations/leaderboard` | 🌐 | query `?range=month\|season\|allTime`; **confirmed only**, privacy rules from `fan-membership.md` §5 applied per row server-side (never trust the frontend to hide a name/amount) |
| `GET /api/admin/donations` | 🔑 `Admin, Super Admin` | filters: status, amount range, purpose, city/country, search |
| `PATCH /api/admin/donations/:id/confirm` | 🔑 same | writes `confirmedBy`/`confirmedAt`; this is the **only** path that makes a donation count anywhere |
| `PATCH /api/admin/donations/:id/reject` | 🔑 same | |
| `PATCH /api/admin/donations/:id/visibility` | 🔑 same | toggles `hiddenByAdmin` independent of the donor's own choice |
| `GET /api/admin/donations/reports` | 🔑 same | CSV/summary export |
| `GET /api/admin/donation-settings` / `PATCH /api/admin/donation-settings` | 🔑 same | singleton, follows the `settings` module's upsert pattern |

## Error codes (shared enum)

`UNAUTHORIZED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, RATE_LIMITED, OUT_OF_STOCK,
VARIANT_INACTIVE, PICKUP_POINT_INACTIVE, NO_DELIVERY_ZONE, COUPON_INVALID, COUPON_EXPIRED,
COUPON_MIN_ORDER, COUPON_LIMIT_REACHED, INVALID_STATUS_TRANSITION, DUPLICATE_SLUG,
DUPLICATE_SKU, LOCKED_ACCOUNT, INTERNAL` — mapped to FR/AR/EN user-facing messages client-side.
