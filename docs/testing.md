# Testing Strategy

> Tooling: **Vitest** for unit/integration (services, validators, RBAC, money math) with
> `mongodb-memory-server` for repo tests · **Playwright** for E2E (checkout, admin flows) ·
> `tsc --noEmit` + ESLint as CI gates. Repo rule: verify with `tsc`, not repeated `next build`
> (builds are slow); a full `next build` runs in CI / before release only.
>
> Test layout: `src/server/modules/<domain>/__tests__/*.test.ts` (unit/integration),
> `e2e/*.spec.ts` (Playwright). `npm run test`, `npm run test:e2e`, `npm run typecheck`.

## 1. Unit tests (services & pure logic)

- **Money:** millimes math, `formatTND`, discount computation (percentage rounding, fixed >
  subtotal clamps to 0, free-delivery type zeroes fee only).
- **Coupon validation:** inactive / before window / after window / min order unmet / global
  limit reached / per-customer limit reached / category & product eligibility / valid path.
- **Order status machine:** every allowed transition passes; every disallowed transition
  (e.g. `PENDING → DELIVERED`, `DELIVERED → *`, `CANCELLED → *`) throws
  `INVALID_STATUS_TRANSITION`; `READY_FOR_PICKUP` only for pickup orders, `SHIPPED` only for
  delivery orders.
- **Stock service:** reserve/decrement/restore math; floor-0 guard; idempotency via
  `stockApplied` (double-confirm does not double-decrement); ledger entry per change.
- **Delivery quote:** city-level overrides governorate-level; free threshold; inactive zone →
  `NO_ZONE`.
- **DTO validation:** phone normalization (+216 formats, spaces, 00216), rejection of invalid;
  qty bounds; unknown-key stripping; `$`-key smuggling rejected (NoSQL injection probe).
- **RBAC:** matrix snapshot test (role → permission set) so accidental grants fail CI;
  `requirePermission` throws for missing/insufficient sessions.
- **Reference generator:** format, uniqueness collision retry.

## 2. Integration tests (repos + services against in-memory Mongo)

- `createOrder` happy paths: delivery order and pickup order — asserts `PENDING` status,
  server-computed totals, customer upsert by phone, snapshots, reference, statusHistory seed.
- `createOrder` rejections: unpublished product, inactive variant, insufficient stock,
  inactive pickup point, missing/inactive delivery zone, invalid coupon, tampered price ignored
  (send fake `unitPrice`/`total` in payload → stored totals still DB-derived).
- Confirm → stock decremented + movement written; cancel after confirm → stock restored;
  cancel before confirm → no stock change.
- Coupon redemption recorded; limits enforced across two orders.
- Unique indexes: duplicate slug/SKU/reference/phone surfaces typed errors.
- Tracking query: correct ref+phone returns projection **without** `adminNotes`; wrong phone
  returns not-found.

## 3. E2E (Playwright, seeded DB)

**Client:** browse `/boutique` → filter by category+size → open PDP → select color+size →
low-stock label correct → add to cart → cart drawer shows line → update qty → apply coupon
(valid + invalid) → checkout step 1 validation errors (bad phone) → **delivery path**
(governorate → fee appears) → review → submit → confirmation shows reference + PENDING timeline
→ `/suivi` with ref+phone shows order. Repeat checkout with **pickup path** (inactive pickup
point never listed). Guest wishlist toggle persists across reload. Sold-out product: add-to-cart
disabled.

**Admin:** login (bad creds → error; lockout after 5) → pending order visible on dashboard →
open order → confirm → status chip + history update; inventory shows decrement → mark
preparing → shipped → delivered → transitions to invalid states not offered → cancel another
order → stock restored → create product with variants → publishes and appears on `/boutique` →
stock adjust with reason → movement in ledger → coupon create → works at checkout → pickup
point deactivate → disappears from checkout → ANALYST login cannot mutate (buttons absent AND
direct action returns FORBIDDEN) → audit log rows exist for all of the above.

## 4. Security tests (automated where possible, else scripted manual)

- Price manipulation: crafted `createOrder` payload with fake prices/totals/negative qty →
  order stored with correct totals or rejected.
- Status manipulation: unauthenticated + customer-session calls to `updateOrderStatus` → 401/403.
- IDOR: customer A cannot fetch customer B's order by id or by ref with wrong phone.
- Admin routes without session → redirect; API without permission → FORBIDDEN (test each role
  against one representative forbidden action).
- Rate limits: 4th `createOrder` in a minute → RATE_LIMITED; 11th tracking lookup → limited.
- XSS: product description with `<script>`/`onerror` payload → sanitized on save and render.
- NoSQL injection: `{"phone": {"$ne": ""}}` style payloads on tracking/login → validation error.
- Upload: non-image renamed `.png` (magic-byte check), 6MB file, SVG → all rejected.
- Headers: CSP/XFO/nosniff present on public + admin responses.
- Coupon brute force: sequential code guessing hits the rate limit.

## 5. Manual checklist (per release, results recorded in progress.md)

- [ ] Mobile (360px, real device): boutique, PDP (sticky ATC, bottom-sheet variants), cart,
  full checkout both paths, tracking.
- [ ] Dark mode: all boutique + admin pages, chip/badge contrast.
- [ ] Arabic RTL: boutique, PDP, checkout, tracking — mirrored layout, no clipped text,
  numerals correct.
- [ ] French + English content fallback (missing AR falls back to FR without breaking layout).
- [ ] SEO: PDP/category `generateMetadata` present, `/sitemap.xml` valid, OG preview renders.
- [ ] Emails render (order received/confirmed/cancelled) with correct FR copy + reference.
- [ ] WhatsApp CTAs open with correct prefilled text + number from settings.
- [ ] Print view of admin order detail is legible.
- [ ] 404/500 pages branded; broken-image fallbacks work.
- [ ] No console errors/warnings on any visited page; no horizontal scroll at 320px.

## 6. CI gates (every PR)

1. `tsc --noEmit` clean. 2. ESLint clean. 3. Vitest suite green. 4. Playwright smoke
(browse→order→confirm) green against a seeded ephemeral DB. 5. `npm audit --audit-level=high`
triaged. Full E2E matrix + manual checklist before release tags.

## 7. Acceptance criteria (mirrors product-specification.md §8)

All pages functional · no broken links · no console errors · no TS errors · no UI overflow ·
no unprotected admin route · no client-trusted totals · order creation → PENDING → full admin
lifecycle → customer tracking all verified by the E2E suite above · stock logic proven by
integration tests · pickup + delivery paths both proven.
