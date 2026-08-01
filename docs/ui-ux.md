# UI/UX Design System — USM Boutique

> Goal: the store must feel like the **official boutique of a serious professional club** —
> premium, emotional, fast — not a generic e-commerce template. Mobile-first always. The public
> boutique moves to a **light retail canvas** (already the direction of the current shop
> redesign); the club's dark/cinematic identity stays for hero/campaign moments. Admin keeps its
> light slate workspace.

## 1. Color tokens

Defined as Tailwind v4 `@theme` tokens in `globals.css` (extending the existing brand tokens —
do not remove the current `--color-usm-*` set; add the boutique aliases below and converge):

| Token | Value | Use |
|---|---|---|
| `--usm-blue-primary` | `#0057FF` (verify against final logo sampling; current code uses `#0D63FF` — pick one in Phase 1 and alias the other) | CTAs, links, active states |
| `--usm-navy` | `#020817` | Hero/campaign backgrounds, footer, admin sidebar |
| `--usm-surface` | `#07111F` | Dark-mode surface |
| `--usm-white` | `#FFFFFF` | Light canvas |
| `--usm-soft-gray` | `#F5F7FA` | Page background (light), zebra rows |
| `--usm-border` | `#D7DEE8` | Hairlines, input borders |
| `--usm-muted` | `#7A8AA0` | Secondary text |
| `--usm-gold` | `#F4C430` | Accents, limited-edition, badges — sparingly |
| `--usm-success` | `#16A34A` | Confirmed, in stock |
| `--usm-warning` | `#FACC15` | Pending, low stock |
| `--usm-danger` | `#DC2626` | Cancelled, sold out, destructive |

Status-chip mapping: Pending=warning, Confirmed=blue, Preparing=blue-soft, Ready/Shipped=indigo,
Delivered=success, Cancelled=danger — identical mapping in client tracking and admin (one shared
`<OrderStatusChip>`).

## 2. Typography

- **Headings (Latin):** Sora (fallback Space Grotesk) — bold, athletic, tight tracking on
  display sizes. Existing Outfit remains on legacy pages until converged.
- **Body (Latin):** Inter.
- **Arabic:** IBM Plex Sans Arabic (fallback Cairo) for both headings and body.
- Loaded via `next/font` with subsets + `display: swap`; CSS vars `--font-display`,
  `--font-sans`, `--font-arabic` (already the convention).
- Scale (mobile → desktop): display 36/56, h1 30/40, h2 24/32, h3 20/24, body 16, small 14,
  caption 12. **Prices are typographic events:** `font-display`, semibold, tabular-nums;
  PDP price 28px; old price struck in `--usm-muted`.

## 3. Components (shadcn-style, in `src/components/ui/`)

Button (primary blue / secondary outline / ghost / destructive / WhatsApp-green variant),
Input+Label+FieldError, Select, RadioCards (delivery method, pickup points), Checkbox, Dialog,
Sheet (mobile filter drawer, variant bottom sheet), Drawer (cart), Tabs, Accordion, Badge,
Chip (dismissible filter), Skeleton, Toast, Stepper (checkout), Table (admin), Pagination,
EmptyState, StatCard. All: keyboard navigable, focus-visible rings (`--usm-blue-primary` at 40%),
logical-property spacing (`ps/pe/ms/me`) for RTL.

### Product card (the signature component)

- 3:4 image area, `object-cover`, rounded-xl, `--usm-soft-gray` backdrop; hover swaps to second
  image (150ms crossfade) + card lift (`translateY(-4px)` + soft shadow, 200ms ease-out).
- Top-left badge stack (max 2): Nouveau (blue), Best Seller (navy), Édition limitée (gold),
  Promo `-X%` (danger). Bottom overlay when relevant: "Stock bas" / "Épuisé" (grayscale image).
- Top-right wishlist heart (tap target ≥ 44px, springs on toggle).
- Body: category (caption, muted) → name (2-line clamp) → price row (price + struck old
  price) → color dots (≤ 5, "+N") .
- Hover (desktop): quick size pills + "Ajout rapide"; Mobile: whole card taps to PDP; quick-add
  via a small + button opening the variant bottom sheet.
- Variants: standard / featured (2× span, editorial) / sale / limited (gold hairline) /
  bundle / compact-carousel / recently-viewed (smaller, no quick-add).

## 4. Layout & responsive rules

- Container `max-w-7xl`, gutters 16px mobile / 24px tablet / 32px desktop; section rhythm
  `py-12` mobile / `py-20` desktop; 8-point spacing grid.
- Grids: products 2/3/4 cols (mobile/md/xl); admin tables collapse to cards below `md`.
- Header (public): logo, nav (Boutique, Collections, Suivi de commande, Contact), search,
  wishlist, cart button with count badge → drawer. Mobile: bottom-aware sticky header +
  hamburger; cart always one tap away.
- Sticky mobile patterns: PDP add-to-cart bar, checkout step CTA pinned above the keyboard-safe
  area, filter drawer from bottom.
- Breakpoints: default Tailwind; design mobile-first, enhance up.

## 5. Motion (Framer Motion)

Principles: **subtle, fast, purposeful** — 150–300ms, `ease-out`, distance ≤ 16px. No bounce
overshoot, no parallax, no flashing, `prefers-reduced-motion` respected globally (variants
collapse to opacity).

| Moment | Motion |
|---|---|
| Page transitions | fade + 8px rise, 200ms |
| Section reveal | once-only viewport fade-up, stagger 60ms |
| Card hover | lift + shadow (CSS, not FM) |
| Add to cart | button → check morph; item flies is **not** used — instead cart badge pulse + drawer peek 1.2s |
| Cart/filter drawer | spring slide (stiff, damped), backdrop fade |
| Wishlist | heart scale 1→1.3→1 with color fill |
| Modal/sheet | scale 0.97→1 + fade |
| Order success | check-circle draw-in + staggered timeline reveal (the one place we're theatrical) |
| Skeletons | shimmer 1.5s linear |

## 6. Dark mode & RTL

- Dark mode: token-driven (`.dark` swaps surface/border/muted values); boutique canvas dark
  variant = `--usm-surface` cards on `--usm-navy`; verify chip/badge contrast in both modes.
- RTL: `dir=rtl` flips via existing language switcher; **only logical properties** in new code
  (`ps-`, `pe-`, `start-`, `end-`, `text-start`); icons with direction semantics (arrows,
  chevrons) flip via `rtl:rotate-180`; numerals stay Latin for prices/references (Tunisian
  convention); test every new screen in AR.
- FR is the default content language; every new translation key lands in all three languages at
  once (existing `translations` convention).

## 7. Accessibility (WCAG 2.1 AA)

Contrast ≥ 4.5:1 body / 3:1 large text (gold on white fails — gold is never text-on-light,
only fills/borders with dark text) · every interactive element keyboard reachable with visible
focus · touch targets ≥ 44×44 · form fields with real `<label>`, errors linked via
`aria-describedby` · images: meaningful alt from media library (decorative → `alt=""`) ·
drawers/dialogs trap focus, `Esc` closes, return focus · status chips carry text, never color
alone · stepper announces current step (`aria-current="step"`) · toasts `role="status"`.

## 8. Page-level art direction

- **Home hero:** full-bleed navy cinematic image/gradient, Sora display headline
  ("Portez les couleurs de Monastir"), dual CTA (primary "Découvrir la boutique", ghost
  "Nouveautés"), subtle gold hairline accents. Below the hero the page shifts to light retail
  canvas.
- **Category banners:** editorial split (image / story text), category-tinted.
- **Checkout:** distraction-free — chrome reduced to logo + secure-reassurance line; stepper on
  top; summary card sticky on desktop right rail.
- **Admin:** data-density first; white cards on `#F8FAFC`; `--usm-blue-primary` reserved for
  primary actions and active nav; charts follow the dataviz palette conventions (one hue family
  + status colors, labeled axes, no 3D).

## 9. Quality bar (applies to every screen)

No layout shift on load (dimensions reserved for images) · skeletons for every async region ·
empty states designed (never a blank div) · error states human and branded · loading buttons
disable + spinner · all copy in FR/AR/EN via the translations mechanism · no horizontal
overflow at 320px width · Lighthouse mobile ≥ 90 performance on `/boutique` and PDP.
