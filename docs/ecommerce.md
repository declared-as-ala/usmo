# E-commerce System — Boutique Functional Specification

> How the whole shopping experience works, end to end. Data model in `database.md`, endpoints in
> `api.md`, visual language in `ui-ux.md`. FR labels are the canonical UI copy (site is FR-first).

## 1. Product browsing

### Shop page `/boutique`

- Server component; products fetched from MongoDB (`PUBLISHED` only), URL-driven state:
  `?categorie=maillots&taille=M&couleur=bleu&prix=50-200&tri=nouveautes&page=2` — filters live in
  the URL so results are shareable, crawlable, and back-button-safe.
- Layout: premium category header → toolbar (product count, sort select, filter button on
  mobile) → active filter chips (dismissible, "Tout effacer") → responsive grid
  (2 cols mobile / 3 tablet / 4 desktop) → pagination.
- Filters (desktop sidebar / mobile bottom-drawer): Catégorie, Collection, Taille, Couleur
  (swatches), Prix (range slider), Disponibilité, Nouveautés, Best-sellers, Édition limitée,
  Promotions, Genre, Âge.
- Sorting: Nouveautés (default) · Plus populaires · Prix croissant · Prix décroissant ·
  Best-sellers · Promotions · Édition limitée.
- Loading: skeleton grid matching card geometry. Empty state: USM-branded illustration,
  "Aucun produit ne correspond à vos filtres", clear-filters CTA.
- Search: text input hitting the product text index; empty-results state suggests categories.

### Category pages `/boutique/[categorie]`

Football, Basketball, Maillots, Accessoires, Kids, Limited Edition, Matchday.
Each: editorial banner (image + category story from the category document), scoped filters
(category pre-applied, chip not removable), grid, related collections strip, "Récemment
consultés" strip (client-side, localStorage list of product slugs, hydrated via a lightweight
lookup).

## 2. Product detail `/produit/[slug]`

- Server-rendered core (SEO) + client islands for interaction.
- Gallery: main image with zoom-on-hover (desktop) / pinch (mobile), thumbnail rail; mobile
  swipeable with position dots.
- Buy box: name, base SKU, category breadcrumb, price TND (promo: old price struck +
  `-X%` badge), badges, short description.
- **Variant selection:** color swatches → size pills. Size availability recomputed per selected
  color from variant stock: available / "Plus que N" (≤ threshold) / "Épuisé" (disabled,
  strikethrough). A variant must be fully selected before add-to-cart enables. Selected variant →
  `variantId` is what enters the cart (fixes the current color-lost-in-cart defect).
- Quantity stepper (1 → min(20, available)).
- CTAs: **Ajouter au panier** (primary), wishlist heart, **Poser une question sur WhatsApp**
  (prefilled message with product name + URL).
- Reassurance block: "💳 Aucun paiement en ligne requis — payez à la livraison ou au retrait" +
  delivery/pickup summary from settings.
- Content tabs/accordion: Description · Matière & entretien · Guide des tailles (modal with
  size table) · Livraison & retrait.
- Below: Produits associés, Souvent achetés ensemble / Complétez le look (manual
  `relatedProducts`, fallback same collection), Récemment consultés.
- Mobile: sticky bottom add-to-cart bar (price + CTA); variant selector opens as a bottom sheet.

## 3. Cart

- **Storage:** localStorage (`usm-cart-v1`) as `[{ variantId, quantity }]` + a React
  `CartProvider`. On cart open / page load, lines are re-validated via `validateCart` —
  authoritative prices, names, images, availability come from the server; stale lines get an
  inline "price updated" / "stock épuisé" notice. Logged-in customers sync via `syncCart`.
- Cart drawer (all pages): line items (image, name, variant, unit price, qty stepper, remove),
  subtotal, "Continuer la commande" CTA, free-delivery progress bar when a threshold exists.
- Cart page `/panier`: same plus coupon field (calls `previewCoupon`; success shows discount
  line + chip, errors show typed FR message), delivery estimate teaser ("choisie à l'étape
  suivante"), suggested products carousel, premium empty state ("Votre panier est vide —
  Portez les couleurs de Monastir") with CTA to `/boutique`.

## 4. Checkout `/commande` — 4 steps, no online payment

Stepper: **1 Informations → 2 Livraison → 3 Vérification → 4 Confirmation.**
State kept client-side until final submit; every step validated with the same zod schemas the
server uses (shared DTOs).

**Step 1 — Informations client:** Nom complet*, Téléphone* (+216 format, validated),
Email (optionnel mais recommandé — "pour recevoir la confirmation"), Ville*, Remarques.
Logged-in customers get prefill.

**Step 2 — Mode de réception** (radio cards):

- **Livraison à domicile** → Adresse complète*, Ville*, Code postal, Gouvernorat* (select, 24),
  Notes de livraison. On governorate/city selection → `getDeliveryQuote` shows fee + estimated
  delay ("Livraison: 8.000 DT · 2–4 jours" / "Livraison gratuite dès 150 DT ✓"). Unserved zone →
  blocking message with WhatsApp fallback.
- **Retrait depuis un point de retrait** → cards from `getActivePickupPoints()`: name, address,
  city, opening hours, phone, map link, notes, availability badge. Selecting one shows its
  pickup instructions. No fee.

**Step 3 — Vérification:** items (image, variant, qty, line total), receding summary of
info + method + address/pickup point (edit links jump back), totals block (Sous-total, Remise
coupon, Livraison, **Total TND** — all values displayed from the last server validation),
customer notes, ☑ "J'accepte les conditions de vente"* .

**Step 4 — Confirmation** (after `createOrder` succeeds):

- Success animation, order reference large and copyable.
- Message: *« Votre commande a été reçue. Elle est en attente de confirmation par la boutique
  officielle USM. »*
- Timeline: En attente → Confirmée → En préparation → Prête / Expédiée → Livrée (first node
  active).
- CTA: **Contacter la boutique officielle** (WhatsApp, prefilled with reference), Suivre ma
  commande (link to `/suivi?ref=…`), Retour à la boutique.
- Email confirmation sent if email provided. Cart cleared.

**Failure paths:** stock changed → back to step 3 with per-line errors; coupon expired mid-flow →
recomputed totals + notice; rate-limited → polite retry message; network → retry-safe (createOrder
is idempotent per client-generated `submissionId` for 10 minutes).

## 5. Order creation (server truth)

`createOrder` pipeline (single service, transaction where the deployment supports it):

1. Rate-limit (IP + phone). 2. Zod parse. 3. Load variants+products from DB — reject inactive/
   unpublished. 4. Recompute unit prices & subtotal **from DB only**. 5. Validate stock against
   available (onHand − reserved) unless backorder allowed. 6. Validate delivery: zone active →
   fee (respect free threshold) **or** pickup point exists + active. 7. Validate coupon fully;
   compute discount. 8. Total = subtotal − discount + fee. 9. Upsert customer by normalized
   phone. 10. Generate unique reference (retry on collision). 11. Insert order:
   `status: PENDING`, statusHistory seeded, snapshots embedded. 12. If
   `stock.decrementOn === 'create-reserve'`: reserve stock (+ movements). 13. Record coupon
   redemption. 14. Notify admins + email customer. 15. Return public projection.

## 6. Order management (admin) & stock rules

Full admin flows in `admin-dashboard.md` §F. Business rules recap:

- Confirm (`PENDING → CONFIRMED`): reserve or decrement per `settings.stock.decrementOn`
  (default **confirm**): decrement `stockOnHand`, release any reservation, write `SALE_CONFIRM`
  movements. If stock is now insufficient, the action fails with per-line details — admin
  adjusts stock or contacts the customer; no silent overselling.
- Cancel from any non-terminal status: if `stockApplied`, restore (`CANCEL_RESTORE` movements).
  Cancellation reason required, customer-visible note optional.
- `stockApplied` flag makes stock side-effects idempotent — a retried transition never
  double-decrements.
- Low-stock notification fires when a movement takes available below the product threshold.

## 7. Order tracking `/suivi`

Form: Référence de commande + Numéro de téléphone → `GET /api/orders/track`. Both must match;
response is the public projection only (no adminNotes, no other customer data). Shows: status
badge + FR label, vertical timeline with timestamps of reached steps, items, delivery method +
address city / pickup point card, customer-visible note, WhatsApp button. Errors are generic
("Commande introuvable — vérifiez la référence et le téléphone") to prevent enumeration; endpoint
rate-limited.

## 8. Customer account (optional)

Register/login (phone + password; phone is the identity key). Dashboard: profile, address book,
order history (cards → detail reusing the tracking view), wishlist page (grid of saved products,
move-to-cart), saved sizes, notification list, support contact. Guest orders placed with the same
phone appear in history after registration (customer upsert links them). An account is **never**
required to buy or track.

## 9. Notifications

- Customer email (if provided): order received, order confirmed, order shipped/ready, order
  cancelled. FR templates with AR/EN variants later. Provider behind a `Mailer` interface
  (console/log driver in dev, SMTP/Resend in prod via env).
- Admin: in-app notification + optional email to `settings.notifications.adminEmails` on new
  order and low stock.
- WhatsApp is always manual (deep links with prefilled text) — no WhatsApp API this phase.

## 10. Wishlist & recently viewed

Wishlist: localStorage for guests, `customers.wishlist` when logged in (merged at login).
Heart toggle on cards + PDP, dedicated page under account, count badge in header.
Recently viewed: localStorage ring buffer (12 slugs), strips on PDP/category pages.
