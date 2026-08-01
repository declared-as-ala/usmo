# Admin Dashboard Specification

> Route base: `/admin`. Protected by middleware (session required) **plus** per-action RBAC
> (see `security.md`). An admin shell already exists (`AdminShell`, `AdminSidebar`, `AdminTopbar`,
> light slate workspace) and is kept and extended — boutique modules are rebuilt DB-backed;
> legacy club modules (matches, news, sponsors…) remain context-backed until a later phase.

## Layout & shell

- **Sidebar** (deep navy, USM logo, collapsible, grouped): Dashboard · *Boutique group:*
  Products, Categories, Collections, Inventory, Orders, Customers, Pickup Points, Delivery
  Zones, Coupons · *Content group:* Media Library, Pages, SEO · *Insights:* Analytics ·
  *System:* Users & Roles, Settings, Audit Logs · *(Legacy club group kept below, unchanged).*
- **Topbar:** breadcrumbs, global search (⌘K — products by name/SKU, orders by ref/phone,
  customers by phone/name), notifications bell (new orders, low stock), quick actions
  (+ Product, + Coupon…), admin profile menu, dark-mode toggle.
- Every table: server-side pagination/sort/filter, column visibility, empty states, CSV export
  where permissioned, skeleton loading. Every destructive action: confirmation dialog stating
  consequences.

## A. Dashboard home `/admin`

Widgets (all from `getDashboardStats`, period selector 7/30/90 days):
Total orders · **Pending orders** (highlighted — this is the daily work queue) · Confirmed ·
Delivered · Cancelled · Order value total & average (TND) · Orders-by-status donut ·
Orders-over-time line · Top products · Low-stock list (link → Inventory) · Out-of-stock count ·
Recent orders table (last 10, inline confirm/cancel for `orders.confirm` holders) ·
Customers by city · Best categories · Coupon usage · Website visits (product-view counts this
phase; real analytics later — labeled honestly).

## B. Products `/admin/products`

**Table:** thumbnail, name, SKU, category, price (promo shown struck), total available stock
(variant rollup, red when any variant ≤ threshold), status (Draft/Published/Archived), badges,
created date, actions (edit, duplicate, archive/delete).
**Filters:** category, collection, status, stock state (in/low/out), badge, price range,
search name/SKU.
**Form** (create/edit, tabbed):

1. *Général:* name FR/AR/EN, slug (auto from FR, editable), SKU, category, collections,
   short + full description (rich text, sanitized), badges, gender, age group.
2. *Images:* picker from Media Library + direct upload, drag-order, alt text; first = main,
   second = hover.
3. *Prix:* price TND, compare-at price (validation: must exceed price), auto-computed discount %.
4. *Variantes:* matrix builder — define sizes + colors (+ edition) → generates variant rows with
   per-variant SKU (auto-suffixed, editable), price override, active toggle. Stock shown
   read-only here (edited in Inventory, initial stock allowed at creation).
5. *Détails:* material, care instructions, size guide, weight, related products picker.
6. *SEO:* title, meta description, OG image, search preview, noIndex.

Publish control separate from save (Draft ↔ Published ↔ Archived). Delete blocked when order
history references the product (offer Archive).

## C. Categories `/admin/categories`

Tree/list with drag reorder (`displayOrder`), fields: name FR/AR/EN, slug, description, banner
image, parent category, active, SEO. Delete blocked while products reference it.

## D. Collections `/admin/collections`

List + form: name, slug, cover image, description, display order, active, SEO. Product
membership managed from a picker (writes `products.collections`). Seeded: Football, Basketball,
Matchday, Kids, Limited Edition, New Arrivals, Best Sellers.

## E. Inventory `/admin/inventory`

- Overview table: product → expandable variant rows: SKU, size/color, **on hand / reserved /
  available**, threshold, status chip (OK / Stock bas / Épuisé). Filters: stock state, category,
  search.
- **Adjust stock** dialog: delta (+/−), required reason (select: Réception, Correction, Casse,
  Retour, Autre + freetext), preview of resulting balance. Atomic, floor 0, writes
  `stockmovements` + audit.
- Movement history per variant (drawer): ledger with type, qty, balance after, order link,
  admin, date.
- Low-stock alert list; Export CSV.
- Rule (enforced in service, documented in UI): creating an order never permanently reduces
  stock; confirm decrements (default) per `settings.stock.decrementOn`; cancel restores.

## F. Orders `/admin/orders` — the operational heart

**Table:** reference, customer name, phone (click-to-call), city, items count, total TND,
delivery method icon (🚚 / 🏪 + pickup point name), payment status chip, **status chip**,
created, last update, actions.
**Status tabs** across the top with live counts: Toutes · En attente · Confirmée · En
préparation · Prête · Expédiée · Livrée · Annulée.
**Filters:** date range, city, delivery method, pickup point, payment status, amount range,
product, customer; search ref/phone/name/email. Export CSV.

**Order detail `/admin/orders/[id]`:**

- Header: reference, status chip, created date, action buttons *(contextual to current status
  and permission):* **Confirmer** · **Annuler** (reason required) · **En préparation** ·
  **Prête pour retrait** / **Expédiée** (per method) · **Livrée** · Imprimer (print-view) ·
  Exporter.
- Customer card: name, phone, email, city + contact buttons (WhatsApp prefilled with reference,
  Appeler, Email) + link to customer profile.
- Items: image, name, variant (size/color), SKU, unit price, qty, line total; totals block
  (subtotal, coupon, delivery, total).
- Delivery card: address (delivery) or pickup point snapshot (pickup).
- Notes: customer notes (read-only) · **internal admin notes** (never public) ·
  **customer-visible note** (shown on tracking).
- Payment status selector (`NOT_PAID / PAY_ON_PICKUP / CASH_ON_DELIVERY /
  BANK_TRANSFER_PENDING / PAID_MANUALLY`).
- **Status timeline:** every transition with admin name + timestamp + note; below it, the
  entity's audit trail.
- Every status change: validated against the transition table, recorded in history with admin +
  timestamp, optional "notifier le client" checkbox (email), stock side-effects per §E rule.

## G. Pickup Points `/admin/pickup-points`

Cards/table: name, address, city, phone, active toggle, display order (drag), orders-using
count. Form: name FR/AR/EN, slug, address, city, governorate, postal code, phone, Google Maps
link, opening hours (structured rows + freetext), available days, pickup instructions, notes,
image, active. Deactivation warning when non-terminal orders reference it; delete blocked in
that case. Seeds: Boutique officielle USM, Stade Mustapha Ben Jannet, Salle Mohamed Mzali,
partner shops Monastir & Sousse.

## H. Delivery Zones `/admin/delivery-zones`

Table grouped by governorate: city (or "tout le gouvernorat"), price TND, estimated delay,
free-delivery threshold, active, notes. Bulk seed for the 24 governorates; inline edit;
city-level rows override governorate-level.

## I. Customers `/admin/customers`

Table: name, phone, email, city, orders count, total value TND, last order, status
(Active/Blocked). Profile page: info + addresses, order list, wishlist, internal notes
(timestamped, authored), communication history (manual log entries: "appelé le…", channel),
block/unblock. Export CSV (permissioned).

## J. Coupons `/admin/coupons`

Table: code, type, value, min order, usage `X / limit`, window, status (auto: Programmé /
Actif / Expiré / Inactif). Form: code, type (Pourcentage / Montant fixe / Livraison gratuite),
value, min order, usage limit, per-customer limit, start/end dates, eligible
products/categories pickers (empty = all), active. Stats drawer: redemptions over time, revenue
of coupon orders.

## K. Media Library `/admin/media`

Folder tree (products, categories, banners, pages, seed), grid with previews, upload (drag &
drop, multi-file, validated + re-encoded server-side), per-item: alt text FR/AR/EN, replace,
move, delete (blocked/warned when in use), copy URL. Automatic optimization (webp, max
2000px, EXIF stripped).

## L. Pages `/admin/pages`

Manage structured content for: Home (boutique hero, featured strips visibility/order), Boutique
header, category landing sections, About, Contact, Terms (Conditions de vente), Privacy, FAQ,
Delivery info, Pickup info. Editor: section blocks (visibility toggle, order, fields per block
type: heading, rich text, image, CTA). Draft/publish. Sanitized server-side.

## M. SEO `/admin/seo`

Overview table across products / categories / collections / pages: title, description, slug,
OG image, ✅/⚠ missing-fields warnings. Inline edit + search-result preview (Google-style
snippet). Global: SEO defaults (title suffix, fallback description/OG), sitemap status (link to
`/sitemap.xml`), redirects manager (from → to, 301/302).

## N. Analytics `/admin/analytics`

Orders by day/week/month (line), orders by status (donut), order value totals & average, best
products, best categories, low-stock report, cancellation report (count + reasons), customers by
city (bar/map-list), coupon usage, product views + view→order conversion, cart abandonment
(best-effort, clearly labeled). Period selector, CSV export. Real data only — anything
illustrative must be labeled as such (existing repo convention).

## O. Users & Roles `/admin/users`

Staff table: name, email, role, active, last login. Invite/create (temp password), edit role
(select of the 6 roles), deactivate (kills sessions). **Permission matrix** rendered from
`rbac.ts` (single source of truth — the displayed matrix is generated from code, not a
hand-maintained copy): view / create / edit / delete / publish / confirm orders / cancel orders /
export / manage settings per role. Guard: the last active SUPER_ADMIN cannot be demoted or
deactivated.

## P. Settings `/admin/settings`

Sections: Identité (club name, logo, favicon) · Contact (email, phone, **WhatsApp number** —
drives every WhatsApp CTA, store address) · Réseaux sociaux · Localisation (default language,
currency TND display) · Livraison (default fee fallback, free threshold) · Retrait (global
pickup instructions) · Stock (`decrementOn`: à la confirmation / réservation à la création;
backorder toggle) · Emails (sender, admin recipient list, per-event toggles) · Notifications ·
SEO defaults. Save per-section, audited with diffs.

## Q. Audit Logs `/admin/audit`

Read-only table: timestamp, actor, action (namespaced), entity (linked), summary of
before→after, IP. Filters: actor, action prefix (auth / product / order / stock / coupon /
settings / user), entity, date range. Covers: logins, product CRUD, order status changes, stock
adjustments, coupon changes, settings changes, role changes. No delete API exists.
