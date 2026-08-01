# Database Design — MongoDB + Mongoose

> Conventions: collection names plural lowercase; `_id: ObjectId` unless stated; every schema has
> `timestamps: true` (`createdAt`/`updatedAt`); **money is stored as integer millimes**
> (1 TND = 1000 millimes) — never floats, never strings; trilingual text uses
> `LocalizedString = { fr: string; ar?: string; en?: string }` (FR required, others fall back to FR).

## 1. Connection

`src/server/db/connect.ts` — cached connection on `globalThis` (serverless/HMR-safe), reads
`MONGODB_URI` from env. Fails fast with a clear message if unset. No connection at module top
level of models.

## 2. Collections

### users (admin/staff accounts)

| Field | Type | Notes |
|---|---|---|
| email | string, **unique index**, lowercase | login identifier |
| passwordHash | string | bcrypt, cost ≥ 12; never selected by default (`select: false`) |
| name | string | |
| role | enum: `SUPER_ADMIN, BOUTIQUE_MANAGER, ORDER_MANAGER, PRODUCT_MANAGER, CONTENT_EDITOR, ANALYST` | permissions derived in code (`rbac.ts`), not stored |
| active | boolean, default true | deactivation instead of deletion |
| lastLoginAt | Date | |
| failedLoginCount / lockedUntil | number / Date | brute-force lockout |
| twoFactorSecret | string, optional, `select: false` | 2FA-ready, unused this phase |

### customers

| Field | Type | Notes |
|---|---|---|
| phone | string, **unique index** | normalized `+216XXXXXXXX`; primary customer key |
| name | string | |
| email | string, sparse index, optional | |
| city | string | |
| addresses | `[{ label, address, city, governorate, postalCode, notes }]` | |
| passwordHash | string, optional, `select: false` | present only if registered account |
| wishlist | `[ObjectId → products]` | |
| savedSizes | `{ jersey?, shoes?, kids? }` | |
| ordersCount / totalSpent / lastOrderAt | denormalized counters | updated in order service |
| status | enum: `ACTIVE, BLOCKED` | |

### categories

`name: LocalizedString`, `slug` (**unique index**), `description: LocalizedString`, `image`,
`parent: ObjectId|null` (self-ref), `displayOrder: number`, `active: boolean`,
`seo: SeoFields`. Index: `{ active: 1, displayOrder: 1 }`.

### collections (marketing collections: Matchday, Limited Edition, …)

`name: LocalizedString`, `slug` (**unique**), `coverImage`, `description: LocalizedString`,
`displayOrder`, `active`, `seo`. Products reference collections (not the reverse) —
`products.collections` array keeps one write path.

### products

| Field | Type | Notes |
|---|---|---|
| name | LocalizedString | |
| slug | string, **unique index** | |
| sku | string, **unique index** | base SKU; variants extend it |
| category | ObjectId → categories, index | |
| collections | [ObjectId → collections], index | |
| description / shortDescription | LocalizedString | sanitized rich text (description) |
| images | `[{ url, alt: LocalizedString, order }]` | `images[0]` = main, `[1]` = hover |
| price | int millimes | current sell price (variant may override) |
| compareAtPrice | int millimes, optional | "previous price"; promo iff > price |
| badges | [enum: `NEW, BEST_SELLER, LIMITED_EDITION, OFFICIAL, PROMO`] | `LOW_STOCK`/`SOLD_OUT` are **computed**, never stored |
| material / careInstructions | LocalizedString | |
| sizeGuide | ObjectId → media or structured table, optional | |
| weightGrams | number, optional | future shipping calc |
| gender | enum: `MEN, WOMEN, UNISEX, KIDS`, optional | filterable |
| ageGroup | enum: `ADULT, KIDS, BABY`, optional | |
| relatedProducts | [ObjectId], optional | manual "complete the look" |
| lowStockThreshold | number, default 5 | |
| status | enum: `DRAFT, PUBLISHED, ARCHIVED` | public queries always filter `PUBLISHED` |
| seo | SeoFields | |
| stats | `{ views: number, ordered: number }` | for best-sellers / conversion analytics |

Indexes: `slug` unique, `sku` unique, `{ status: 1, category: 1 }`,
`{ status: 1, collections: 1 }`, text index on `name.fr, name.ar, name.en, sku` for search,
`{ 'stats.ordered': -1 }`.

### productvariants

Separate collection (not subdocuments) so stock updates are atomic single-doc ops.

| Field | Type | Notes |
|---|---|---|
| product | ObjectId → products, index | |
| sku | string, **unique index** | e.g. `USM-JRS-HOME-26-M-BLU` |
| size | string | from product's size set |
| color | `{ name: LocalizedString, hex }`, optional | |
| edition | string, optional | e.g. "Limited 2026" |
| priceOverride | int millimes, optional | else product.price |
| stockOnHand | int ≥ 0 | physical stock |
| stockReserved | int ≥ 0 | held by confirmed (or created, per setting) orders |
| active | boolean | |

**Available stock = `stockOnHand - stockReserved`** — computed, never stored.
Compound index `{ product: 1, size: 1, 'color.hex': 1, edition: 1 }` unique.

### stockmovements (append-only ledger)

`variant` (ObjectId, index), `product` (ObjectId, index), `type` (enum: `ADJUSTMENT, RESERVE,
RELEASE, SALE_CONFIRM, RESTOCK, CANCEL_RESTORE`), `quantity` (signed int), `reason` (string),
`order` (ObjectId, optional), `admin` (ObjectId → users, optional), `balanceAfter` (int).
Index `{ variant: 1, createdAt: -1 }`. Every stock change writes here — no exceptions.

### carts (server-persisted, optional)

Guest carts live in localStorage; this collection only backs logged-in customers'
carts for cross-device sync. `customer` (ObjectId, unique index),
`items: [{ variant: ObjectId, quantity }]`, `updatedAt` TTL-cleaned after 90 days
(TTL index on `updatedAt`).

### orders

| Field | Type | Notes |
|---|---|---|
| reference | string, **unique index** | `USM-YYMMDD-XXXX` (XXXX = base32 random, collision-retried) |
| customer | ObjectId → customers, index | always set (guest → upserted by phone) |
| customerSnapshot | `{ name, phone, email?, city }` | immutable copy at order time |
| items | `[OrderItem]` (subdocs) | see below |
| subtotal / discount / deliveryFee / total | int millimes | **all server-computed** |
| coupon | `{ code, couponId, type, value }`, optional | snapshot |
| deliveryMethod | enum: `HOME_DELIVERY, PICKUP` | |
| deliveryAddress | `{ address, city, postalCode, governorate, notes }`, required iff HOME_DELIVERY | |
| pickupPoint | ObjectId + `pickupPointSnapshot { name, address, city, phone, hours }`, required iff PICKUP | |
| deliveryZone | ObjectId, optional | fee source snapshot in `deliveryFee` |
| status | enum (7 values, see spec §5), index | default `PENDING` — enforced in service, and schema default |
| statusHistory | `[{ status, at, by: ObjectId|null, note? }]` | append-only; `by: null` = system/customer |
| paymentStatus | enum: `NOT_PAID, PAY_ON_PICKUP, CASH_ON_DELIVERY, BANK_TRANSFER_PENDING, PAID_MANUALLY` | default `NOT_PAID` |
| customerNotes | string | from checkout |
| adminNotes | string | internal only — **never** returned by public tracking API |
| customerVisibleNote | string | shown on tracking page |
| stockApplied | boolean | whether reserve/decrement ran (idempotency guard) |

`OrderItem` subdoc: `variant` (ObjectId), `productSnapshot { productId, name: LocalizedString,
slug, image, sku, size, color?, edition? }`, `unitPrice` (int millimes, from DB at creation),
`quantity` (int 1–20), `lineTotal`.

Indexes: `reference` unique, `{ status: 1, createdAt: -1 }`, `{ customer: 1, createdAt: -1 }`,
`{ 'customerSnapshot.phone': 1, createdAt: -1 }` (tracking lookup), `createdAt` desc.

### pickuppoints

`name: LocalizedString`, `slug` (**unique**), `address`, `city`, `governorate`, `postalCode`,
`phone`, `mapsUrl`, `openingHours: [{ days, open, close }]` + freetext fallback, `notes:
LocalizedString`, `pickupInstructions: LocalizedString`, `availableDays: [0-6]`, `image?`,
`active: boolean` (**index**), `displayOrder`. Seed examples: Boutique officielle USM, Stade
Mustapha Ben Jannet, Salle Mohamed Mzali, partner stores Monastir/Sousse.

### deliveryzones

`governorate` (string, index), `city` (string, optional — city-level override wins over
governorate-level), `price` (int millimes), `estimatedDays: { min, max }`,
`freeDeliveryThreshold` (int millimes, optional), `active` (index), `notes`.
Compound unique index `{ governorate: 1, city: 1 }`.

### coupons

`code` (uppercase, **unique index**), `type` (enum: `PERCENTAGE, FIXED, FREE_DELIVERY`),
`value` (percentage 1–100 or millimes), `minOrder` (millimes, optional), `usageLimit` /
`usageCount`, `perCustomerLimit`, `startsAt` / `endsAt`, `eligibleProducts: [ObjectId]`,
`eligibleCategories: [ObjectId]` (empty = all), `active`. Redemptions tracked in
**couponredemptions** (`coupon`, `order`, `customerPhone`, index `{ coupon: 1, customerPhone: 1 }`)
so per-customer limits are enforceable atomically.

### media

`url`, `filename`, `mimeType`, `sizeBytes`, `width/height`, `folder` (string path), `alt:
LocalizedString`, `uploadedBy` (ObjectId → users), `usedBy` (optional refs for safe-delete
warnings). Index `{ folder: 1, createdAt: -1 }`.

### pages

`slug` (**unique**; `home, about, contact, terms, privacy, faq, delivery-info, pickup-info`),
`title: LocalizedString`, `sections: [{ key, type, visible, order, content: mixed }]` (structured
blocks, sanitized), `seo`, `status: DRAFT|PUBLISHED`.

### settings (single document)

`_id: 'global'` (string id). `clubName`, `logoUrl`, `faviconUrl`, `contact { email, phone,
whatsapp, address }`, `socials { facebook, instagram, youtube, tiktok }`, `defaultLanguage`,
`currency: 'TND'`, `stock { decrementOn: 'confirm' | 'create-reserve', allowBackorder: false }`,
`delivery { defaultFee, freeThreshold }`, `checkout { termsUrl, minOrderTotal? }`,
`notifications { emailEnabled, adminEmails[] }`, `seoDefaults { titleSuffix, description, ogImage }`.
Read through a cached `getSettings()` with revalidation on write.

### auditlogs (append-only)

`actor` (ObjectId → users | null), `actorName` (snapshot), `action` (dot-namespaced string:
`auth.login`, `product.create`, `order.status.confirmed`, `stock.adjust`, `coupon.update`,
`settings.update`, `user.role.change`, …), `entityType` / `entityId`, `before` / `after`
(diff-relevant fields only, redacted of secrets), `ip`, `userAgent`.
Indexes: `{ createdAt: -1 }`, `{ entityType: 1, entityId: 1 }`, `{ actor: 1, createdAt: -1 }`.

### notifications

`recipientType` (`ADMIN` | `CUSTOMER`), `recipient` (ObjectId, indexed), `type`
(`ORDER_CREATED, ORDER_STATUS, LOW_STOCK, SYSTEM`), `title/body: LocalizedString`, `readAt`,
`meta` (orderId, etc.). Index `{ recipient: 1, readAt: 1, createdAt: -1 }`.

`SeoFields` (embedded, shared): `title: LocalizedString`, `description: LocalizedString`,
`ogImage?`, `noIndex?: boolean`.

### Fan accounts, membership, media access & donations (Mongoose/NestJS — see `fan-membership.md`)

> Implemented as real Mongoose schemas under `apps/api/src/modules/*`, not the server-actions
> pattern above. Collection names below follow this repo's actual Mongoose default (lowercased,
> pluralized class name) rather than the `snake_case` convention used elsewhere in this file.

#### users (extended)

The existing `apps/api` `User` schema (`name, email, password, role, status`, `timestamps`) gains:

| Field | Type | Notes |
|---|---|---|
| firstName / lastName | string, optional | `name` stays as a derived/back-compat display field |
| displayName | string, optional | shown publicly instead of real name when set |
| phone | string, optional | not unique (email remains the unique login key) |
| avatar | string (MinIO URL), optional | uploaded via a new fan-scoped endpoint, folder `users/avatars` |
| city / country | string, optional | |
| favoriteSport | enum: `football, basketball, both`, optional | |
| favoritePlayer | string, optional | freetext |
| privacySettings | `{ showProfilePublicly, showCity, showRanking, showDonationBadge, showDonationAmount, useNickname }`, all boolean, default `false` except where noted in `fan-membership.md` | |
| newsletterOptIn | boolean, default false | |
| emailVerified | boolean, default false | verification flow not required this phase — field exists for later |
| role | free-form string (unchanged type) | gains value `'Fan'` alongside existing `'Customer' / 'Admin' / 'Super Admin'` |

#### membershipplans

| Field | Type | Notes |
|---|---|---|
| name | string | e.g. "Fan Gold" |
| slug | string, **unique index** | |
| description | string | |
| price | int millimes, optional | 0/absent = free plan |
| durationDays | number | e.g. 365 |
| benefits | string[] | freeform bullets shown on the plan card |
| badge | string, optional | icon name or image URL |
| color | string, optional | hex accent |
| isActive | boolean, index | |
| displayOrder | number | |

#### memberships

| Field | Type | Notes |
|---|---|---|
| userId | ObjectId → users, index | |
| planId | ObjectId → membershipplans | |
| status | enum: `pending, active, expired, cancelled, suspended, rejected`, index | see transition rules in `fan-membership.md` §2 |
| source | enum: `manual, online`, default `manual` | payment-ready field, unused this phase |
| startDate / endDate | Date, optional until approved | |
| approvedBy / approvedAt | ObjectId → users / Date, optional | |
| cancelledBy / cancelledAt | ObjectId → users / Date, optional | |
| renewedFrom | ObjectId → memberships, optional | links a renewal to its predecessor |
| statusHistory | `[{ status, at, by: ObjectId\|null, note? }]` | append-only, mirrors the `orders` pattern |
| internalNote | string, optional | admin-only |
| proofFile | string (MinIO URL), optional | |

Index `{ userId: 1, status: 1, endDate: -1 }` for the "does this user have an active membership"
lookup used by the `RequireActiveMembership` guard.

#### donationsettings (singleton — follows the `settings` module's `key`-based upsert pattern)

| Field | Type | Notes |
|---|---|---|
| key | string, unique, default `'donations'` | singleton discriminator |
| suggestedAmounts | number[] (millimes) | e.g. `[10000, 20000, 50000, 100000]` |
| minAmount | int millimes | |
| purposes | `[{ key, label }]` | admin-editable list |
| manualPaymentInstructions | string | |
| bankDetails | `{ bankName, rib, accountHolder }`, optional | |
| proofRequired | boolean | |
| leaderboardEnabled | boolean | |
| showExactAmounts | boolean | global gate, combined with per-donation `showAmount` — see privacy rule in `fan-membership.md` §5 |
| allowAnonymous | boolean | |
| badgeThresholds | `{ loyalSupporterCount, goldDonorTotal, legendDonorTotal }` (millimes/counts) | |

#### donations

| Field | Type | Notes |
|---|---|---|
| userId | ObjectId → users, index | required — donations are tied to a fan account |
| amount | int millimes | |
| currency | string, default `'TND'` | |
| purpose | string (matches a `donationsettings.purposes[].key`) | |
| method | enum: `bank_transfer, cash_at_club, manual_mobile` | |
| status | enum: `pending, confirmed, rejected, cancelled, refunded`, index | only `confirmed` counts anywhere; `refunded` unused this phase |
| proofFile | string (MinIO URL), optional | |
| message | string, optional | |
| displayNameMode | enum: `fullName, nickname, anonymous` | |
| showAmount | boolean | |
| showOnLeaderboard | boolean, default true | admin can still hide via `hiddenByAdmin` |
| hiddenByAdmin | boolean, default false | admin override independent of the donor's own choice |
| confirmedBy / confirmedAt | ObjectId → users / Date, optional | |
| rejectedBy / rejectedAt | ObjectId → users / Date, optional | |
| internalNote | string, optional | |

Index `{ status: 1, createdAt: -1 }`, `{ userId: 1, createdAt: -1 }`.

#### fanpoints (append-only ledger)

`userId` (ObjectId, index), `points` (signed int), `reason` (string, e.g. `'vote_cast'`,
`'daily_mission'`), `sourceType` / `sourceId` (optional refs), `createdAt`. Total for a fan =
`SUM(points)` over their rows (aggregation, not a denormalized counter, to keep the ledger
authoritative). Index `{ userId: 1, createdAt: -1 }`.

#### fanvotes / fanvoteentries

`fanvotes`: `title`, `isActive` (boolean, index — only one should be true at a time, enforced in
service), `options: [{ key, label }]`, `startsAt`/`endsAt`, optional.
`fanvoteentries`: `voteId` (ObjectId), `userId` (ObjectId), `optionKey` (string), `createdAt`.
Compound unique index `{ voteId: 1, userId: 1 }` — one vote per fan per poll.

#### mediaalbums / mediavideos (migrated from `apps/web/src/data/mediaMockData.ts`)

Field lists mirror the existing frontend `MediaAlbum`/`MediaVideo`/`MediaPhoto` interfaces
(title/titleFr/titleAr, slug unique, description*, coverImage/thumbnail, category, sport, season,
tags, date, isFeatured, status draft/published, seo*, plus video-specific `sourceType`/
`videoUrl`/`duration`/`sponsor`), with `MediaPhoto` **embedded** in `mediaalbums.photos: []`
(unchanged from the frontend shape) rather than a separate collection. New fields on both:

| Field | Type | Notes |
|---|---|---|
| accessLevel | enum: `public, registered, members`, default `public`, index | see `fan-membership.md` §4 |
| allowedPlanIds | ObjectId[] → membershipplans, optional | modeled now, no UI yet |

Index `{ status: 1, accessLevel: 1, createdAt: -1 }`.

#### auditlogs (lightweight — no backend audit module exists today; this is new for this repo)

`adminId` (ObjectId → users), `action` (string, e.g. `'membership.approve'`, `'donation.confirm'`),
`entityType` / `entityId`, `createdAt`. Deliberately minimal (no before/after diff, no ip/UA)
compared to the aspirational `auditlogs` design earlier in this file — write from membership and
donation admin actions only this phase; extend later if a fuller audit trail is needed.

### Validation & seeding notes for this feature

- Reuse the repo's **money-as-integer-millimes** convention for `membershipplans.price` and all
  `donations`/`donationsettings` amounts.
- Seed 3–7 starter membership plans (see `fan-membership.md` §2) via a standalone script
  following the existing `apps/api/src/seed-news.ts` / `seed-heritage.ts` pattern (direct
  `mongoose.connect`, not a full Nest app bootstrap).
- Media migration: a one-off script reads `apps/web/src/data/mediaMockData.ts`'s exported arrays
  and inserts them into `mediaalbums`/`mediavideos` with `accessLevel: 'public'` by default,
  then an admin manually promotes a few items to `registered`/`members` for testing.
- `donationsettings` / any future singleton follows the exact upsert-on-read pattern already used
  by `apps/api/src/modules/settings/settings.service.ts` (`findOneAndUpdate({key}, {$setOnInsert},
  {new:true, upsert:true, setDefaultsOnInsert:true})`).

## 3. Validation rules (schema + zod, both layers)

- Phone: normalize then match `^\+216[2-9]\d{7}$` (allow generic `^\+\d{8,15}$` behind a setting).
- Email: RFC-ish zod `.email()`, lowercase.
- Quantity: int, 1–20 per line; ≤ available stock when `allowBackorder=false`.
- Money: non-negative int millimes; `compareAtPrice > price` when present.
- Slugs: `^[a-z0-9]+(?:-[a-z0-9]+)*$`, unique per collection.
- Coupon window: `startsAt < endsAt`; value bounds by type.
- Order create: delivery method present; matching address XOR pickup point; pickup point
  active; delivery zone active; terms accepted.
- All rich text sanitized server-side before persist (allowlist HTML).

## 4. Data lifecycle

- **Orders/audit/stockmovements are never hard-deleted** (legal/accounting trail). Orders only
  reach terminal statuses; audit and movements are append-only.
- Products/categories/pickup points: soft lifecycle via `status`/`active`; hard delete allowed
  only when nothing references them (repo checks orders/variants first).
- Customers: block instead of delete; deletion (GDPR-style request) anonymizes snapshots
  (`name → "Deleted customer"`, phone hashed) rather than removing orders.
- Guest carts: localStorage only; server carts TTL 90 days.
- Media: delete blocked with a warning when `usedBy` non-empty.

## 5. Seeding

`src/server/db/seed.ts` (run via `npm run seed`): 1 SUPER_ADMIN (credentials from env), the 6
roles exercised via sample users, ~20 realistic USM products (jerseys home/away/third, basketball
kit, hoodies, caps, scarves, kids, limited edition) with variants + stock, categories
(football, basketball, maillots, accessoires, kids, limited-edition), collections (matchday,
new-arrivals, best-sellers), 5 pickup points, delivery zones for all 24 governorates
(Monastir/Sousse cheaper), 3 sample coupons, default settings, sample pending orders for demo.
Product images must be locally hosted files under `public/uploads/seed/` — **no hotlinked
external URLs** (repo rule).
