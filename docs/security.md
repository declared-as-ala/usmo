# Security Specification

> Threat model: a public storefront taking real orders (customer PII: names, phones, addresses)
> with a privileged admin area. Highest-value attacks: price/total manipulation, admin takeover,
> customer-data enumeration, stock/coupon abuse. This is a defensive spec — every rule here is
> enforced **server-side**; client-side checks are UX only.

## 1. Authentication

- **Admin:** Auth.js (NextAuth v5) credentials provider against `users`. bcrypt (cost ≥ 12).
  JWT session strategy in **HTTP-only, `Secure`, `SameSite=Lax`** cookies; session maxAge 12h
  with rolling refresh; `AUTH_SECRET` from env.
- **Customer (optional accounts):** separate credentials provider (phone + password), same
  cookie hardening, session distinct from admin (role claim `customer` — never elevatable).
- **Brute force:** per-account counter — 5 consecutive failures ⇒ 15-min lock
  (`lockedUntil`), doubled on repeat; per-IP rate limit on the login route (10/min).
  Uniform error "Identifiants invalides" (no user-exists oracle); uniform response timing
  (hash comparison always runs).
- Password policy: ≥ 10 chars for admins (≥ 8 customers), checked with zod; no complexity
  theater, length + common-password blocklist.
- Logout invalidates client cookie; deactivating a user bumps a per-user `sessionVersion`
  claim check so existing JWTs die immediately.
- **2FA-ready:** `twoFactorSecret` field + a `requires2fa` hook point in the login flow exist
  from day one; TOTP UI is a later phase.

## 2. Authorization (RBAC)

Single source of truth: `src/server/lib/rbac.ts`.

```
Permissions: products.view/edit/publish/delete · inventory.view/adjust · orders.view/edit/
confirm/export · customers.view/edit/export · logistics.manage · coupons.manage ·
media.manage · content.edit · seo.edit · analytics.view · users.manage · settings.manage ·
audit.view
```

| Role | Grants |
|---|---|
| SUPER_ADMIN | everything |
| BOUTIQUE_MANAGER | everything except users.manage, audit.view limited to boutique actions |
| ORDER_MANAGER | orders.*, customers.view/edit, inventory.view, analytics.view |
| PRODUCT_MANAGER | products.*, inventory.*, media.manage, seo.edit (products), analytics.view |
| CONTENT_EDITOR | content.edit, media.manage, seo.edit, pages |
| ANALYST | *.view, analytics.view, audit.view, export — zero mutations |

Enforcement layers (defense in depth):

1. `middleware.ts`: any `/admin/*` or `/api/admin/*` request without a valid **admin** session →
   redirect/401. Cheap gate only — never the sole check.
2. **Every server action/route handler** starts with
   `const admin = await requirePermission('orders.confirm')` — throws `FORBIDDEN` otherwise.
   No action trusts that "the UI wouldn't have shown the button."
3. UI hides what the role can't do (UX), but hiding is not security.
4. Customer endpoints scope every query by the session's customer id — no object-level access by
   guessable ids (IDOR): order detail fetches are always `{ _id, customer: session.customerId }`
   or `{ reference, phone }` pairs.

## 2b. Fan accounts, membership & donations — additional RBAC and enforcement rules

> This repo's **actual** auth (`apps/api/src/modules/auth/`) differs from §1/§2 above: hand-rolled
> JWT (no Passport/Auth.js), `JwtAuthGuard` reads an HttpOnly `jwt` cookie or a `Bearer` header,
> `RolesGuard` string-matches `request.user.role` against `@Roles(...)` metadata with **no
> hierarchy** (every endpoint lists every accepted role explicitly). This section extends that
> real system rather than the Auth.js model described above.

- **New role**: `'Fan'` (free-form string, no enum to migrate — same mechanism as existing
  `'Customer'`/`'Admin'`/`'Super Admin'` values).
- **New guard**: `RequireActiveMembership` — after `JwtAuthGuard` populates `request.user`, looks
  up `{ userId: user.sub, status: 'active', endDate: { $gte: now } }` in `memberships`; throws
  `ForbiddenException` if none found. Applied via `@UseGuards(JwtAuthGuard, RequireActiveMembership)`
  on every ⭐-marked endpoint in `api.md`. **This is the actual security boundary for the Fan
  Zone and premium media — the frontend's 3-state paywall UI is UX only.**
- **New guard**: `OptionalJwtAuthGuard` — for the public/teased media list & detail endpoints,
  which must succeed for anonymous callers. Attempts token verification; on failure, proceeds
  with `request.user = undefined` instead of throwing. Downstream code treats `undefined` as
  visitor-level access.
- **Throttling** — `@nestjs/throttler` is installed but **not currently wired anywhere** in this
  codebase (verified: no `ThrottlerModule` import, no `@Throttle` usage). Wiring it in is a
  prerequisite for this feature: apply to `POST /api/auth/register`, `POST /api/donations`, and
  `POST /api/me/membership/request` at minimum, since these are unauthenticated-or-fan-writable
  endpoints that create admin-review workload if abused.
- **Membership status is the sole access boundary** for Fan Zone ⭐ endpoints and `members`-level
  media — never accept an `isActiveMember` or similar flag from the client; always re-derive from
  the `memberships` collection on every guarded request (no caching a stale boolean into the JWT
  payload, since memberships can expire mid-session).
- **Donation privacy — the two-gate rule is a hard requirement, not a UI nicety**:
  a donation's name/amount is shown publicly only when **both** the donor's own
  `displayNameMode`/`showAmount` choice **and** the admin's global
  `donationsettings.showExactAmounts` allow it. The leaderboard endpoint computes this
  server-side per row; the frontend must never receive a real name/amount it isn't allowed to
  display (do not send the raw field and hide it client-side — omit or substitute it in the API
  response itself).
- **Only `confirmed` donations are ever counted or displayed** outside the admin donations queue
  — enforce with the query filter (`status: 'confirmed'`) at the service layer, not just by
  convention.
- **File uploads from fans** (avatar, donation proof, future membership proof) must go through
  **new, narrowly-scoped endpoints** — the existing `apps/api/src/modules/storage/` controllers
  are entirely `@Roles('Admin', 'Super Admin')`-gated and must **not** be opened up to fans.
  Instead, new endpoints (`POST /api/me/avatar`, `POST /api/donations/:id/proof`) inject the
  exported `StorageService` directly, apply the same mime/size validation constants
  (`ALLOWED_IMAGE_MIMES`, `MAX_IMAGE_SIZE`), and use new `FOLDERS` entries (`users/avatars`
  already exists; add `DONATIONS = 'donations'`). Read the authenticated uploader's id from
  `req.user.sub` — the existing admin storage controller has a latent bug reading `userId`
  instead, which silently produces `undefined`; do not copy that bug into new endpoints.
- **Audit logging** — no backend audit-log module exists today (the admin "Latest Activity" feed
  is frontend-only, sourced from `AppContext`). This feature introduces a minimal `auditlogs`
  collection (see `database.md`) and must write an entry for every membership approve/reject/
  renew/suspend/cancel and every donation confirm/reject/visibility-toggle action, at minimum
  `{ adminId, action, entityType, entityId, createdAt }`.
- **`ValidationPipe` has `forbidNonWhitelisted: true` globally** — every new DTO (register,
  profile update, membership request, donation submit, admin approve/confirm bodies) must
  explicitly declare every field it accepts; an undeclared field in the request body fails the
  whole request with a 422, which is a common integration-testing gotcha for this codebase.

## 3. Input validation & injection defense

- **Zod DTOs on every input** (actions, route handlers, even admin forms). Unknown keys
  stripped (`.strict()` on DTOs). Shared between client (UX) and server (authority).
- **NoSQL injection:** validated DTOs mean no user value is ever an object (`$gt`, `$where`
  can't smuggle in — zod coerces/rejects non-string). Never build Mongo filters by spreading
  request objects; repos accept typed params only. `sanitizeFilter: true` on user-facing queries.
- **XSS:** rich text (product descriptions, pages) sanitized server-side with an allowlist
  (b/i/strong/em/p/ul/ol/li/a[href http(s)]/h2-h4/img[src same-origin]) before persist **and**
  rendered through the sanitizer's output only. Everything else is plain text via React's
  default escaping. No `dangerouslySetInnerHTML` outside the one sanitized-rich-text component.
- **File uploads:** admin-only; allowlist mime (jpeg/png/webp/avif) verified by magic bytes,
  ≤ 5 MB, re-encoded with sharp (kills polyglot/EXIF payloads), random UUID filenames, served
  from a static path with no execution, `Content-Type` set from our re-encode not the upload.
- Phone/email normalization before validation to keep unique indexes meaningful.

## 4. E-commerce-critical rules (money & stock)

**Never trusted from the client:** cart totals, unit prices, discount amounts, delivery fees,
product names, coupon results. The client sends only *identifiers and quantities*
(`variantId`, `qty`, `couponCode`, `pickupPointId`, address fields).

Server-side on `createOrder` (see `ecommerce.md` §5): prices re-read from DB · variant must be
active + product PUBLISHED · stock checked against available · pickup point exists **and
active** · delivery zone exists **and active**, fee computed server-side · coupon fully
re-validated (window, limits, eligibility, min order) · totals computed server-side ·
status forced to `PENDING` (not a client field at all — absent from the DTO).

**Status changes:** only via `updateOrderStatus` behind `orders.confirm`/`orders.edit`;
transition table enforced; stock side-effects idempotent (`stockApplied`). The public tracking
endpoint is read-only by construction.

**Stock integrity:** all changes are atomic `findOneAndUpdate` with `$inc` +
`{ stockOnHand: { $gte: qty } }` guards (no read-modify-write races); every change writes the
`stockmovements` ledger.

## 5. Rate limiting

Fixed-window+burst limiter (in-memory LRU per instance now; interface allows Redis later):
login 10/min/IP · register 5/hour/IP · `createOrder` **3/min per IP and per phone**, 20/day/phone ·
tracking lookup 10/min/IP · `previewCoupon` 10/min/IP (anti code brute-force) · uploads
20/hour/admin. Responses use `RATE_LIMITED` code, generic message, `Retry-After`.

## 6. CSRF & headers

- Server actions carry Next's built-in origin checks; Auth.js manages CSRF tokens for its
  routes; the few custom POST route handlers verify `Origin`/`Sec-Fetch-Site` against the host.
  Session cookies `SameSite=Lax`.
- `next.config.ts` security headers on all routes:
  `Content-Security-Policy` (self + data: images + no inline script beyond Next's hashed
  requirements), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy` (camera/mic/geolocation off), HSTS in production.

## 7. Secrets & configuration

`.env.local` (gitignored; `.env.example` committed): `MONGODB_URI`, `AUTH_SECRET`,
`SEED_ADMIN_EMAIL/PASSWORD`, mail credentials. Nothing secret in `NEXT_PUBLIC_*`. Startup env
validation (zod) fails fast with named missing vars. No secrets in logs or audit entries
(redaction list applied to before/after diffs).

## 8. Error handling & information exposure

Typed `AppError(code)` → user-safe FR/AR/EN messages; unexpected errors log full detail
server-side (with request id) and return generic `INTERNAL` to clients. Tracking/lookup
endpoints return indistinguishable not-found for wrong-ref vs wrong-phone. Admin existence,
coupon existence, and customer existence are never disclosed to unauthenticated callers. Stack
traces never serialize (Next production behavior + our Result wrapper).

## 9. Audit logging

Every sensitive mutation writes `auditlogs` (append-only, no deletion API): logins
(success/failure), product CRUD/publish, order status + payment changes, stock adjustments,
coupon CRUD, settings diffs, user/role changes, media deletions. Entries carry actor, IP,
user agent, entity, redacted before/after. Viewable by SUPER_ADMIN/ANALYST only.

## 10. Production hardening checklist

- [ ] HTTPS-only, HSTS enabled, cookies `Secure`.
- [ ] MongoDB: dedicated DB user (readWrite on this DB only), IP allowlist / VPC, TLS.
- [ ] `npm audit` clean (or triaged) in CI; lockfile committed; Dependabot/Renovate on.
- [ ] Seed credentials rotated after first deploy; no default admin password.
- [ ] Backups: daily automated dump + restore drill documented.
- [ ] Logs: request id correlation, no PII in access logs beyond necessity.
- [ ] Security test pass from `testing.md` §security executed and recorded in `progress.md`.
- [ ] Uploaded-file storage isolated; `public/uploads` served with immutable cache headers.
- [ ] Rate-limit + lockout behavior verified in production config.
- [ ] The permission matrix page in admin reflects `rbac.ts` exactly (generated, not duplicated).
