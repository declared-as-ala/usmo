# USM Boutique — Product Specification

> Official e-commerce platform for **Union Sportive Monastirienne (US Monastir / USM)**.
> This document is the single source of truth for *what* we are building. See
> `implementation-roadmap.md` for *when* and `architecture-audit.md` for *where we start from*.

## 1. Business Goal

Build the **official online boutique** of US Monastir so that:

- Fans anywhere in Tunisia (and the diaspora) can browse and **order official USM products**.
- Orders are created **without online payment** — the club confirms each order manually
  (phone/WhatsApp), collects payment on delivery, on pickup, or by bank transfer.
- The club staff runs the entire operation from a **role-based admin dashboard**: products,
  variants, stock, orders, customers, pickup points, delivery zones, coupons, content, settings.
- The platform is **production-ready, secure, mobile-first, and SaaS-ready** — architecture must
  allow adding online payment and extracting the backend to NestJS later without a rewrite.

**Not in scope for this phase:** online payment / card entry, multi-club white-labeling,
football/basketball content sections (they exist as legacy frontend and are kept, but the boutique
is the priority), native mobile apps.

## 2. Target Users

| User | Description | Primary needs |
|---|---|---|
| **Fan / Customer** | USM supporter, mostly on mobile, FR-first (AR/EN supported) | Browse, order easily, no forced account, track order by reference + phone |
| **Boutique staff (Order Manager)** | Handles daily orders | Confirm/cancel orders fast, contact customer via WhatsApp/call, update statuses |
| **Product Manager** | Manages catalog | CRUD products/variants/stock, images, collections, promotions |
| **Boutique Manager** | Runs the store | Everything above + coupons, pickup points, delivery zones, analytics |
| **Super Admin** | Club IT / leadership | All permissions + users & roles, settings, audit logs |
| **Content Editor** | Marketing | Pages, banners, SEO, media library |
| **Analyst** | Reporting | Read-only analytics and exports |

## 3. Core Business Flow (acceptance-level)

1. Admin creates products, variants (size/color/edition), stock, categories, collections,
   pickup points, and delivery zones.
2. Customer browses `/boutique`, filters, opens a product, selects variant + quantity, adds to cart.
3. Customer checks out in 4 steps: **info → delivery/pickup → review → confirmation**.
   - Delivery: **Livraison à domicile** (full address + governorate; delivery fee from the
     matching delivery zone) or **Retrait point de retrait** (choose an active admin-created
     pickup point; no delivery fee).
4. Order is created server-side with status **`PENDING` / EN ATTENTE**, a unique reference
   (e.g. `USM-260710-A3F2`), and a server-recalculated total. Client-sent totals are never trusted.
5. Customer sees confirmation with the status timeline
   *(En attente → Confirmée → En préparation → Prête / Expédiée → Livrée)*, the WhatsApp contact
   button, and receives an email if they provided one.
6. Admin sees the pending order, contacts the customer if needed, then **confirms** or **cancels**.
   Stock is reserved/decremented on confirmation (configurable) and restored on cancellation.
7. Admin advances the status until `DELIVERED` (home delivery) or `READY_FOR_PICKUP → DELIVERED`
   (pickup). Every transition is recorded in the status history with admin + timestamp.
8. Customer tracks the order anytime at `/suivi` using **order reference + phone number**.

## 4. Feature Inventory

### 4.1 Public site (client)

| # | Feature | Detail |
|---|---|---|
| P1 | Home page | Cinematic boutique-first hero ("Boutique Officielle US Monastir"), featured categories, new arrivals, best sellers, matchday & limited-edition collections, supporter packs, "why official" trust section, delivery/pickup explainer, newsletter, socials |
| P2 | Shop `/boutique` | Product grid, filters (category, collection, size, color, price, availability, badges, gender, age group), sorting, search, filter chips, product count, mobile filter drawer, skeletons, empty states |
| P3 | Category pages `/boutique/[category]` | Editorial banner + story, scoped filters, grid, related collections, recently viewed |
| P4 | Product detail `/produit/[slug]` | Gallery with zoom + thumbnails, price TND + promo/old price + discount badge, badges, variants (color/size) with per-variant stock, quantity, add to cart, wishlist, WhatsApp question, size guide, material/care, delivery & pickup info, "no online payment" reassurance, related / recently viewed; mobile: swipeable gallery, sticky add-to-cart, bottom-sheet variant selector |
| P5 | Cart `/panier` | Line items with variant + qty controls, remove, subtotal, coupon field, delivery estimate, suggested products, branded empty state |
| P6 | Checkout `/commande` | 4 steps, no payment; customer info (name, phone required; email optional; city; notes), delivery **or** pickup point, review with terms acceptance, confirmation with reference + timeline + WhatsApp CTA |
| P7 | Order tracking `/suivi` | Lookup by reference + phone; status, timeline, items, delivery method, customer-visible admin note, WhatsApp button |
| P8 | Customer account (optional login) | Register/login, profile, addresses, order history, wishlist, saved sizes, notifications |
| P9 | Contact `/contact` | Club/store contacts, WhatsApp, map, socials, contact form |

### 4.2 Admin dashboard (see `admin-dashboard.md` for full detail)

Dashboard home (KPIs/widgets) · Products · Categories · Collections · Inventory · Orders ·
Customers · Pickup Points · Delivery Zones · Coupons · Media Library · Pages · SEO · Analytics ·
Users & Roles · Settings · Audit Logs.

## 5. Order Lifecycle

**Order statuses** (stored as enum, displayed FR-first):

| Code | FR label | Meaning |
|---|---|---|
| `PENDING` | En attente | Default at creation. Awaiting store confirmation |
| `CONFIRMED` | Confirmée | Admin validated (stock reserved/decremented here by default) |
| `PREPARING` | En préparation | Being prepared |
| `READY_FOR_PICKUP` | Prête pour retrait | Pickup orders only |
| `SHIPPED` | Expédiée | Delivery orders only |
| `DELIVERED` | Livrée | Terminal success |
| `CANCELLED` | Annulée | Terminal; restores stock if it was reserved/decremented |

Allowed transitions: `PENDING → CONFIRMED | CANCELLED`; `CONFIRMED → PREPARING | CANCELLED`;
`PREPARING → READY_FOR_PICKUP (pickup) | SHIPPED (delivery) | CANCELLED`;
`READY_FOR_PICKUP → DELIVERED | CANCELLED`; `SHIPPED → DELIVERED`. Terminal states are final.

**Payment statuses:** `NOT_PAID` (default), `PAY_ON_PICKUP`, `CASH_ON_DELIVERY`,
`BANK_TRANSFER_PENDING`, `PAID_MANUALLY`. No online payment in this phase; the schema keeps room
for a future `PAID_ONLINE`.

## 6. Key Business Rules

1. **Server is the source of truth for money.** Prices, coupon discounts, delivery fees, and
   totals are recalculated server-side from the database on every order creation. Client-sent
   amounts are ignored.
2. **Stock is not permanently reduced at order creation.** Depending on the
   `stock.decrementOn` setting (`confirm` default, or `reserve-on-create`), stock is
   reserved/decremented when the admin confirms. Cancelling restores it.
3. **New orders are always `PENDING`.** No path creates an order in any other status.
4. Pickup point must exist **and be active** at order creation; delivery city must map to an
   **active delivery zone** (fee + estimated time come from the zone; free-delivery threshold
   honored).
5. Coupons are validated server-side: code exists, active, within date window, min order met,
   usage limits (global + per customer/phone) not exceeded, product/category eligibility.
6. Guests can order — an account is never required. Customer records are keyed by phone number
   and merged into accounts if the customer later registers with the same phone.
7. All admin mutations are permission-checked server-side and audit-logged.

## 7. Languages, Currency, Locale

- Currency: **TND** only, format `129.000 DT` (3 decimals per Tunisian convention, configurable).
- Languages: **FR-first**, with AR (RTL) and EN. Product content fields are trilingual
  (`fr` / `ar` / `en`) following the existing parallel-field pattern.
- Phone validation: Tunisian mobile format (`+216` + 8 digits) with room for international.

## 8. Acceptance Criteria (release gate)

- [ ] All public pages and admin pages functional — no dead buttons, no static mockups.
- [ ] Order can be created end-to-end (both delivery and pickup paths) and lands as `PENDING`.
- [ ] Admin can execute every status transition; history records admin + timestamp.
- [ ] Stock logic works: confirm decrements, cancel restores, sold-out blocks add-to-cart.
- [ ] Tracking works with reference + phone; wrong phone reveals nothing.
- [ ] Tampered client prices/totals/coupons are ignored — server recalculates (verified by test).
- [ ] No unprotected admin route or API; role permissions enforced server-side.
- [ ] No TypeScript errors, no console errors, no broken links/images, no UI overflow.
- [ ] Mobile-first responsive, dark mode, AR RTL all verified.
- [ ] SEO metadata on products/categories/pages; sitemap generated.
