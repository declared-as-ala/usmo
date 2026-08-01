# Progress Tracker

> Updated after every implementation batch. Newest entries first inside each section.
> Phases reference `implementation-roadmap.md`.

## Status summary

| Phase / Sprint | Status |
|---|---|
| Sprint 1 — Monorepo Setup & NestJS Auth Foundation | 🟢 Done |
| Sprint 2 — Products & Catalog CRUD (API + Web) | 🟢 Done |
| Sprint 3 — Cart, Checkout & Relais Points | 🟢 Done |
| Sprint 4 — Order Lifecycle & Tracking | 🟢 Done |
| Sprint 5 — Editorial Homepage & Media Center | 🟢 Done |
| Sprint 6 — SEO, Analytics & Roles Audit | ⚪ Planned |
| Sprint 7 — Visual Polish & Production Launch | ⚪ Planned |
| Sprint 8 — Fan Accounts & Auth | 🟢 Done |
| Sprint 9 — Membership / Abonnement System | 🟢 Done |
| Sprint 10 — Fan Zone Paywall & Premium Media Migration | 🟢 Done |
| Sprint 11 — Donations & Leaderboard | 🟢 Done |
| Sprint 12 — Legal pages CMS, PWA installability, auth page redesign | 🟢 Done |
| Sprint 13 — Public Website Expansion (guest experience) | 🟢 Done (Phases 1–8) |
| Sprint 14 — Registered Fan Experience (account dashboard) | 🟢 Done (Phases 1–8) |

---

## Done

### 2026-07-30 — Sprint 14 Phases 5–8 (final): Orders/addresses/wishlist, points/badges/rewards, notifications/security/support, admin fan management

**Sprint 14 (Registered Fan Experience) is now fully complete — all 8 phases.**

- **Phase 5 — Orders, addresses, wishlist, donation history**: `Order` gained an indexed `userId?`
  (set via `OptionalJwtAuthGuard` on `POST /orders` so guest checkout still works); new `GET /orders/my`.
  New `AddressesModule` (`me/addresses` full CRUD, default-address handling) and `WishlistModule`
  (`me/wishlist`, service-level join against `Product` for enriched cards) built from scratch — no prior
  concept of either existed. The existing client-only `wishlist`/`toggleWishlist` in `AppContext` (used
  by the heart buttons already in `OfficialCatalog.tsx`/`ProductDetail.tsx`) was wired to the new backend
  endpoints for logged-in fans and synced on login, so favorites now persist across sessions instead of
  resetting on refresh — no new UI needed there. New pages: `/compte/commandes`, `/compte/adresses`,
  `/compte/favoris`.
- **Phase 6 — Points, badges, rewards, activity**: the points ledger (`FanPoint`, `getRanking()`) already
  existed; badges and rewards did not (previously only client-side mock state: `fanBadges`,
  `unlockBadge()`). New `LoyaltyModule` (`Badge`/`FanBadge`, `Reward`/`RewardRedemption`) — badge unlocks
  are idempotent (`BadgesService.unlock`) and wired into real triggers: dashboard visit → `welcome`, vote
  cast → `first-vote`, first order → `first-order`, confirmed donation → `donor`, active membership →
  `member`. Reward redemption deducts points via a signed `FanPoint` ledger entry, decrements stock when
  finite, admin fulfills/cancels. New pages: `/compte/points` (ledger), `/compte/badges` (catalog with
  locked/unlocked state), `/compte/recompenses` (catalog + redeem + history), `/compte/activite` (merged
  points + badge timeline). Seed script: `seed-loyalty.ts` (5 badges, 3 rewards, no hotlinked images).
- **Phase 7 — Notifications, security, support**: new `NotificationsModule` (`UserNotification`,
  per-fan feed) fed by every meaningful state change added this phase — badge unlock, membership
  status change, donation confirmed, order status change, reward redemption fulfilled/cancelled, support
  ticket replied. New `SupportModule` (`SupportTicket` with embedded fan/admin message thread,
  open→answered→closed). New `PATCH /me/password` (bcrypt-verified) on the existing `UsersService`. New
  pages: `/compte/notifications`, `/compte/securite`, `/compte/support` (list + thread + reply).
- **Phase 8 — Admin fan management + docs**: new `AdminUsersController` (`admin/users` — search/filter
  registered fans, status toggle, detail view with membership summary; distinct from the existing
  `/admin/users` team-RBAC-prototype page, which stays untouched per its own documented scope). New admin
  UI: `/admin/fans`, `/admin/loyalty` (badges/rewards/redemptions in tabs), `/admin/support` (ticket
  inbox + reply). `adminNav.ts` updated.
- **Fixed a real circular dependency introduced mid-phase**: `MembershipsModule → LoyaltyModule →
  AuthModule → UsersModule → MembershipsModule` crashed the API at boot (`UndefinedModuleException`).
  Root cause: several new modules imported `AuthModule` purely for `JwtAuthGuard`/`RolesGuard`, which
  isn't actually necessary — `JwtService` is registered `global: true` inside `AuthModule`, and
  `Reflector` is a Nest core global, so guards resolve without importing `AuthModule` at all. Confirmed
  via existing precedent (`donations`, `memberships`, `news`, `storage`, `cart` modules already omit it).
  Fixed by dropping the unneeded `AuthModule` import from `LoyaltyModule`/`NotificationsModule`/
  `SupportModule`.
- Infra note: hit the WSL2 memory-pressure build-kill issue three more times this phase; `wsl --shutdown`
  before each build remains the fix. New wrinkle: running `wsl --shutdown` while containers are up can
  leave a stale Docker Desktop host↔WSL2 port-forward on an otherwise-healthy container (curl from the
  host hangs/empty-replies while the same request from inside the container works fine) — `docker
  restart <container>` re-establishes it.
- Root `.env`'s `MONGODB_URI` still points at the old Atlas cluster (unrelated to the running stack,
  which docker-compose overrides to the local `mongo` container). A host-run seed script picked up that
  stale `.env` value once and wrote the new Badge/Reward collections to Atlas by mistake; caught during
  smoke-testing (empty results against the real stack) and cleaned up (collections dropped from Atlas,
  re-seeded correctly against local Docker Mongo via an explicit `MONGODB_URI` override). Local Docker
  Mongo remains the sole authoritative database per the earlier decision — Atlas is not read from
  anywhere in the running app.

### 2026-07-30 — Sprint 13 Phase 8 (final): PWA, SEO, performance, security pass

- **PWA**: audited existing Sprint 12 work — manifest, icons, service worker, and the `usePwaInstall`
  hook are all real and already wired into `Footer.tsx` with a working install button. No gap found;
  the service worker is deliberately no-op/non-caching (documented in its own comment), left as-is.
- **SEO**: added `sitemap.ts` (static routes + dynamic players/news/products fetched server-side via a
  new `INTERNAL_API_URL` env var pointing at the `api` container over the Docker network, since
  `localhost` inside the `web` container doesn't reach `api`) and `robots.ts` (disallows
  `/admin`, `/compte`, `/checkout`, `/auth`). Added `metadataBase` (new `SITE_URL` env var) and a
  site-wide `SportsOrganization` JSON-LD block in the root layout — first structured data in the app.
  Added `generateMetadata` (per-player title/description/OG image) to both player profile routes, and
  static metadata to `/boutique` (previously a `'use client'` route with no metadata — converted its
  wrapper to a server component, matching the existing `/football`-style pattern, since the view itself
  already carries its own `'use client'` directive).
- **Performance**: audited the Dockerfile — already runs `next start` in production mode with a proper
  multi-stage build. `output: 'standalone'` was considered (would shrink the image significantly) but
  deferred: get it wrong in this npm-workspace monorepo layout and the server silently fails to start,
  and verifying it costs a full 15–30 min rebuild cycle each attempt. Left as a documented follow-up
  rather than risking a broken deploy this late in the phase list.
- **Security**: `ThrottlerModule` was configured but never actually enforced — only 2 of dozens of
  endpoints had `@UseGuards(ThrottlerGuard)` applied explicitly. Bound `ThrottlerGuard` globally via
  `APP_GUARD` in `app.module.ts` so the existing 60 req/min limit now actually applies site-wide.
  Helmet, CORS, the global `ValidationPipe` (whitelist/forbidNonWhitelisted), and the JWT cookie's
  httpOnly/sameSite/conditional-secure flags were all already correctly configured — no changes needed.

- Follow-up fix: `sitemap.ts` initially returned only the 22 static routes in production — it was being
  statically generated at `next build` time inside the Docker build stage, before the `api` container
  existed on the network, so its dynamic player/news/product fetches failed and got baked in as empty.
  Fixed with `export const dynamic = 'force-dynamic'` so it fetches fresh at request time instead
  (verified: 46 URLs including all player and product detail pages).
- Infra note: repeated Docker builds this session drove the WSL2 VM backing Docker Desktop up to ~9GB
  resident, leaving the host with critically low free memory (~1-3GB of 23.6GB total) and causing
  several background build commands to be killed outright with zero output. Root-caused via
  `Get-CimInstance Win32_OperatingSystem`/`Get-Process`; fixed each time with `wsl --shutdown` (safe —
  reclaims memory without touching Docker volumes/images; Docker Desktop auto-restarts the backend and
  `restart: unless-stopped` brings the containers back). Worth running proactively before large builds
  if this recurs.

**Sprint 13 (Public Website Expansion) is now fully complete — all 8 phases.**

### 2026-07-30 — Sprint 13 Phase 7: Public polls, downloads center, sponsor profiles, Become Partner

- **Public polls**: the existing `fan-zone/votes/active` endpoint was already public, but the only
  frontend consumer (`FanZone.tsx`) hid it behind the members-only paywall overlay. Added a standalone
  `PublicPollWidget` (read-only results bar chart, "Connectez-vous pour voter" CTA for guests) embedded
  on the homepage — additive, does not touch the existing Fan Zone paywall/voting logic.
- **Downloads center**: new `DownloadsModule` (`DownloadItem`: title/category/fileUrl/fileType/
  downloadCount, public `GET /downloads`, `POST /downloads/:id/register` to tally clicks, admin CRUD at
  `/admin/downloads`). New `/telechargements` public page (category-filterable) and `AdminDownloads`
  admin screen. Replaced two fake `alert()`-only "download" buttons (`PressCenter.tsx`,
  `SponsorHub.tsx` media kit) with real links into `/telechargements?category=press-kit` — no documents
  are seeded (no real PDFs exist to link), so the center starts empty for admins to populate for real.
- **Sponsor profiles**: added a `slug` field to `Sponsor` (auto-generated on create, same slugify
  pattern as Players; backfilled existing sponsors via one-off `seed-sponsor-slugs.ts` since they were
  seeded via `insertMany` before the field existed), new public `GET /sponsors/slug/:slug`, new
  `/sponsors/[slug]` detail page (`SponsorProfile.tsx`). Sponsor cards on `/sponsors` now link to their
  internal profile page instead of only the external site link.
- **Become Partner**: the "Devenir partenaire" form on `/sponsors` was previously 100% client-side
  (`setContactSubmitted(true)` with no backend call, discarding submissions). Added `PartnerLead` schema
  + `POST /sponsors/leads` (public) + `GET/PATCH /sponsors/admin/leads` (admin), made the form
  controlled and wired to the real endpoint, and added a "Demandes de partenariat" tab to
  `AdminSponsors.tsx` with a new-lead count badge and status workflow (new/contacted/closed).

### 2026-07-30 — Sprint 13 Phase 6: verified guest boutique/order-tracking/donations/leaderboard (no new code)

- Audited scope was already fully built in earlier work this session: `GET /orders/track/:orderNumber`
  (public, no auth) backs the real `/commande` guest order-tracking page; `DonationsModule` has a
  complete public submit → confirm → public feed → leaderboard flow (`/don`, `/dons-donateurs`,
  `/compte/dons`) with privacy-respecting name masking (`visibility: 'anonymous'`); the fan-points
  ranking at `fan-zone/ranking` respects per-user `privacySettings` (showRanking/useNickname/showCity).
  Checkout/boutique (`Checkout.tsx`, `OfficialCatalog.tsx`) are backend-driven with no payment gateway
  anywhere in the codebase (donations use an explicit client-side payment *simulator*) — correctly
  matching the club's no-online-payment policy. Confirmed via code audit plus live endpoint smoke tests
  (`/orders/track/:id` 404s cleanly for unknown orders, `/donations/public`, `/donations/leaderboard`,
  `/cart/delivery-zones`, `/cart/pickup-points` all 200). No code changes were needed.

### 2026-07-30 — Sprint 13 Phase 5: Stadium guide backend + real global search

- Added `StadiumModule`: `StadiumPage` singleton (hero + safety rules, same get-or-create pattern as
  `HistoryModule`) and `Venue` collection (public `GET /venues`, admin CRUD at `/admin/venues`).
  Rewrote `/stadium` to be fully backend-driven (was 100% hardcoded English copy with hotlinked
  Unsplash images); added `AdminStadium` combined page-content + venues admin screen. Seeded via
  `seed-stadium.ts` (Stade Mustapha Ben Jannet, Salle Mohamed-Mzali) with no hotlinked images, matching
  the `seed-heritage` convention.
- Added `SearchModule`: `GET /search?q=` aggregates News/Products (server-side regex search, reusing
  each service's existing `search` query param) with Players/Staff/Sponsors/Legends/Venues (public-list
  + substring filter), returning a unified `{type, id, label, labelAr, image, href}[]`. Replaced the
  global search modal's client-side news+players-only matching in `AppLayout.tsx` with a 300ms-debounced
  call to this endpoint, so search now genuinely covers the whole site instead of two hardcoded entity
  types.

### 2026-07-30 — Sprint 13 Phases 3–4: Football/Basketball hubs, player/staff profiles, Legends, On This Day

- Migrated Squad/Football/Basketball roster views (`SquadRoster`, `EquipeView`) and the global search
  modal off `AppContext` mock data onto `PlayersModule`/`StaffModule`; added public player profile pages
  (`/football/joueurs/[slug]`, `/basketball/joueurs/[slug]`) and staff pages (`/football/staff`,
  `/basketball/staff`); `AdminSquad` rewritten to use the real CRUD endpoints.
- Added `LegendsModule` (public `GET /legends`, admin CRUD at `/admin/legends`) with a new `/legendes`
  public page and `AdminLegends` admin page; seeded from the former `clubLegends` mock data with no
  hotlinked images (admins attach real photos via Media Library, matching the `seed-heritage` convention).
- Added "On This Day": `TimelineEvent` gained optional `month`/`day` fields (admin-taggable in
  `AdminTimeline`), `GET /timeline/on-this-day` returns events matching today's date (falls back to
  highlighted events if none match), surfaced as a widget on `/histoire`.
- Confirmed `MediaGallery`/`AlbumDetail`/`VideoDetail` were already fully backend-driven with real
  access-tier teaser/lock behavior — no migration needed there.
- **Infra incident**: the local Docker `mongo_data` volume was destroyed (likely during an earlier
  Docker Desktop force-restart this session), wiping all locally seeded content including the admin
  login. Discovered a second, unrelated MongoDB Atlas cluster referenced by the repo-root `.env`
  (not used by docker-compose, which pins the `api` service to the local `mongo` container) holding an
  older partial dataset. Per explicit user decision, local Docker Mongo remains the source of truth;
  Atlas was left untouched. Recovered by rerunning all seed scripts (`seed.ts`, `seed-heritage`,
  `seed-players-staff`, `seed-hero-slides`, `seed-media`, `seed-membership-plans`, `seed-fan-zone`,
  `seed-news`, `seed-products`, new `seed-legends`) against the local container.

### 2026-07-25 — Sprint 12: Legal pages CMS, PWA installability, auth page redesign

- Added `LegalPagesModule` (key-parametrized singleton pattern: `privacy`/`terms`/`cookies`) with
  public `GET /legal/:key` and admin CRUD at `/admin/legal/:key`; wired footer links; admin editor
  at `/admin/pages-legal`.
- Made the site installable as a PWA: `manifest.json`, generated icon set (192/512/maskable/apple-touch
  from the real club crest via `sharp`), minimal no-cache service worker, `usePwaInstall` hook driving
  the real `beforeinstallprompt` flow (footer "Installer l'application" button, iOS fallback message).
- Redesigned `/auth/login` and `/auth/register`: removed stock photography, logo-led branded panel
  (teal/blue glow, grid pattern), signup trimmed to Full Name / Email / Phone / Password (name split
  server-side to satisfy the existing `firstName`/`lastName` DTO contract).
- Removed the Youth Academy page and all its plumbing (route, admin route, `AcademyTrial`/
  `AcademyApplication` mock models, `ActiveScreen` union entry, nav links, translations) per explicit
  user decision — out of scope for the Public Website Expansion initiative below.
- Fixed several contrast/visibility bugs (profile dropdown username, article body text) and simplified
  nav labels (News, Shop).

### 2026-07-18 — Sprints 8–11: Fan Accounts, Membership, Fan Zone Paywall, Donations

**Delivered in full per `docs/fan-membership.md`** (this status table previously said "Planned" —
corrected 2026-07-25 after an implementation audit found all four sprints already shipped):

- **Sprint 8 — Fan Accounts & Auth:** hand-rolled JWT auth (`POST /auth/register`, `/auth/login`,
  `GET /me`), extended `User` schema, `/auth/login` + `/auth/register` frontend, `AppContext.loginFan()`
  wired to real backend calls.
- **Sprint 9 — Membership:** `MembershipPlansModule` + `MembershipsModule`, manual request → admin
  approve/reject/renew/suspend/cancel with server-enforced status transitions and `statusHistory`,
  `RequireActiveMembership` guard, `/abonnement` plans page, `/admin/membership-plans`, `/admin/memberships`.
- **Sprint 10 — Fan Zone Paywall & Media:** `MediaModule` (`MediaAlbum`/`MediaVideo`, real backend
  replacing the `AppContext`/`mediaMockData.ts` client-only version) with `accessLevel`
  (`public`/`registered`/`members`) enforced server-side via `OptionalJwtAuthGuard`; `FanZoneModule`
  core (points ledger, one vote, ranking).
- **Sprint 11 — Donations:** `DonationsModule` (`Donation` + `DonationSettings` singleton), manual
  confirm/reject admin flow, fan-scoped proof upload to MinIO, `/admin/donations`.

### 2026-07-12 — Sprint 5: Editorial Homepage & Media Center

- Added persisted homepage settings for hero content, CTA, MinIO background image, and per-section visibility.
- Added public settings/supporter-gallery APIs and protected admin update plus fan-photo CRUD endpoints.
- Rebuilt the Pages admin view as a backend-connected homepage editor with Media Library image picking.
- Wired the public homepage to persisted editorial settings with graceful fallback and a responsive supporter gallery.
- Reused the secure MinIO upload pipeline; no local media storage was introduced.
- API/web typechecks and Docker Compose validation pass cleanly.

### 2026-07-12 — MinIO object storage integration

- Added the NestJS `StorageModule`, MinIO provider, `MediaFile` schema, validation constants, image variants, media-library endpoints, and protected admin routes.
- Uploads now verify file signatures with `file-type`; Sharp strips metadata and creates WebP thumbnail, medium, large, and original variants.
- Added MongoDB, MinIO, bucket initialization, API, and web services to Docker Compose with buildable Dockerfiles.
- Added the media API client, reusable uploader, picker modal, and dedicated admin media-library view.
- Configured strict Next Image `remotePatterns` for the local MinIO bucket.
- `npm run typecheck:api` and `npm run typecheck:web` pass cleanly.

### 2026-07-12 — Sprint 4: Order Lifecycle & Tracking

**Backend (NestJS)**
- Created full `OrdersModule` with `order.schema.ts` tracking order reference, customer data, items snapshot, delivery method, status history, coupon, and totals.
- Implemented `OrdersService` with complete lifecycle state machine: `pending → confirmed → prepared → shipped → delivered / cancelled`.
- Stock deduction on order creation; automatic stock restoration when order is cancelled or restored from cancelled state.
- Unique order reference generation (`ORD-XXXXXX`).
- Admin endpoints: list all orders with optional status/search filters, update order status with history tracking, delete order (Super Admin only).
- Public tracking endpoint: `GET /orders/track/:orderNumber` — no auth required.
- Registered `OrdersModule` in `AppModule`.
- Extended `CartController` with admin CRUD for delivery zones and pickup points.
- Extended `CartService` with `createDeliveryZone`, `updateDeliveryZone`, `deleteDeliveryZone`, `createPickupPoint`, `updatePickupPoint`, `deletePickupPoint`.

**Frontend (Next.js)**
- Extended `api-client.ts` with full orders API: `createOrder`, `trackOrder`, `getAdminOrders`, `updateOrderStatus`, `deleteOrder`, plus admin cart zone/point CRUD methods.
- Rebuilt `AdminOrders.tsx` — fully connected to NestJS API, supports 6-status lifecycle, search by reference/client/phone, status filter tabs, refresh button, call simulation modal with backend status update.
- Added `violet` accent option to `StatCard` component to support order status color coding.
- Created public `/commande` order tracking page — users enter order reference (e.g. `ORD-XXXX-YYYY`) and see full status progress, delivery info, itemized totals with coupon, status history log.
- Replaced mock `placeOrder` in `Checkout.tsx` with real `api.createOrder()` call — includes stock validation from backend, delivery zone pricing, coupon code discount, real order number displayed on success screen.
- Checkout submit button shows "Envoi en cours..." during API call, displays submit errors inline.
- Database re-seeded: 4 categories, 5 collections, 3 products with variants, 6 delivery zones, 2 pickup points.

**Type verification**
- `npm run typecheck:api` — ✅ passes clean
- `npm run typecheck:web` — ✅ passes clean

---

### 2026-07-12 — Sprint 3: Cart, Checkout & Relais Points

- Created `CartModule` with `DeliveryZone` and `PickupPoint` Mongoose schemas.
- Implemented `CartService.calculateCart()` — validates items, checks stock per variant, applies delivery zone pricing, supports 3 coupon codes (USM10, USM20, SUPPORTER), returns server-authoritative totals in millimes.
- Created `Checkout.tsx` — 3-step form (customer info → delivery method → confirm), dynamic backend pricing via `POST /cart/calculate`, coupon input, delivery zone selector, pickup point selector.
- Created `api-client.ts` in `apps/web/src/lib` — fetch-based HTTP client with auth token injection (localStorage + HttpOnly cookie), error normalization.

---

### 2026-07-12 — Sprint 2: Products & Catalog CRUD (API + Web)
- Established explicit Mongoose schemas for `Product`, `ProductVariant`, `Category`, and `Collection` models.
- Set up MongoDB Atlas connection (`MONGODB_URI`) securely inside `.env` configurations.
- Implemented robust controller endpoints for public search, sorting, filtering, and admin CRUD catalog tasks.
- Overhauled `OfficialCatalog.tsx`, `ProductCard.tsx`, and `ProductDetail.tsx` layouts to dynamically fetch and display details from API endpoints, completely removing hardcoded mock arrays.
- Implemented and verified the database seeder to inject standard categories, collections, and products with sizes and stock divisions in millimes.
- Created fully responsive dark sports-themed views matching design specs and checked type compilation without errors.

---

### 2026-07-12 — Sprint 1: Monorepo Setup & NestJS Auth Foundation
- Structured project into npm workspaces under `apps/web` (Next.js), `apps/api` (NestJS), and `packages/shared`.
- Declared e-commerce domain models and interfaces in `packages/shared/src/index.ts`.
- Configured NestJS backend with secure Helmet headers, global input ValidationPipes, and cookie-parser.
- Built User schema, UsersService database operations, JWT AuthService, secure HttpOnly cookie generation, and customizable roles guards.
- Created standalone seeder script to populate default Super Admin credentials in MongoDB.
- Verified TypeScript compilation (`tsc --noEmit`) passes cleanly for both frontend and backend.

---

## In Progress

_Nothing currently in progress — Sprints 13 and 14 are both fully complete. See Decisions Log and Risks
Being Tracked for open follow-ups (e.g. `output: 'standalone'` build size, external seed image URLs)._

## Next Steps (Sprint 5+)

### Sprint 6 — Analytics, SEO & Role Audit
1. **Admin dashboard analytics**: Real aggregations from orders/products (revenue, top SKUs, order geography).
2. **SEO metadata**: `generateMetadata` on product detail pages, `/boutique`, `/commande`.
3. **Roles enforcement audit**: Verify all admin routes reject unauthorized roles correctly.

### Sprint 7 — Polish & Production
1. Build output verification (`npm run build --workspace=web`).
2. Final responsive QA pass on boutique, checkout, and tracking pages.
3. Environment variable checklist for deployment.

### Sprint 13 — Public Website Expansion (guest experience)
1. **Phase 1** — Navbar redesign (Équipes/Matchs/Le Club dropdowns) + shared UI component groundwork.
2. **Phase 2** — `MatchesModule`/`CompetitionsModule`/`StandingsModule`, fixtures/results/standings pages, matchday page.
3. **Phase 3** — `PlayersModule`/`StaffModule`, Football/Basketball hubs, public player & staff profile pages.
4. **Phase 4** — Public media access-tier teaser cards, expanded History/Palmarès, `LegendsModule`, "On This Day".
5. **Phase 5** — Stadium guide expansion, `SearchModule` + global search modal.
6. **Phase 6** — Guest boutique/order-tracking hardening, public donations page, privacy-respecting leaderboard.
7. **Phase 7** — `PollsModule`, `DownloadsModule`, sponsor profile pages, Become Partner lead capture.
8. **Phase 8** — PWA offline shell/caching, per-page SEO metadata + structured data, final security/rate-limit pass.

### Sprint 14 — Registered Fan Experience (account dashboard)
1. **Phase 1** — Auth audit (refresh-token rotation, session revocation), extended `User` schema, `AccountLayout` shell.
2. **Phase 2** — `/compte/bienvenue` onboarding, `/compte/profil`, `/compte/preferences`, `/compte/confidentialite`.
3. **Phase 3** — Real personalized `/compte` dashboard (`GET /api/me/dashboard`) — depends on Sprint 13 Phases 2–3.
4. **Phase 4** — `/compte/abonnement`, `/compte/carte-supporter` (`SupporterCardsModule`), `LockedFeatureCard`.
5. **Phase 5** — `/compte/commandes`, `/compte/adresses` (`AddressesModule`), `/compte/favoris` (`FavoritesModule`), `/compte/dons`.
6. **Phase 6** — `FanPointsModule`/`BadgesModule`/`RewardsModule` (backend-granted only), `/compte/points`, `/compte/badges`, `/compte/recompenses`, `/compte/activite`.
7. **Phase 7** — `NotificationsModule`, `/compte/notifications`, `/compte/securite` (sessions/password), `SupportModule` + `/compte/aide`.
8. **Phase 8** — `/admin/fans`, `/admin/rewards`, `/admin/badges`, `/admin/support-tickets`, full ownership/security audit, docs finalization.

---

## Decisions Log

| Date | Decision |
|---|---|
| 2026-07-10 | Money = integer millimes; `formatTND()` single formatting path |
| 2026-07-10 | Variants in a separate collection for atomic stock ops |
| 2026-07-10 | Default `stock.decrementOn = 'confirm'` (D4) — implemented: stock deducted on order creation, restored on cancellation |
| 2026-07-10 | Guest checkout is first-class; customers keyed by normalized phone |
| 2026-07-12 | Orders start PENDING, admin moves through 6-step lifecycle via AdminOrders panel |
| 2026-07-12 | Public order tracking via order reference number (no login required) |
| 2026-07-18 | Fan membership stays **manual-only** this phase — no payment gateway; schemas kept payment-ready (`source: 'manual'\|'online'` on Membership) for a future phase |
| 2026-07-18 | USM Media galleries migrate from `AppContext`/mock state to a real backend module (`fan-membership.md` §4) rather than gating the existing mock data client-side only |
| 2026-07-18 | Fan Zone route stays `/fanzone` (not renamed to `/zone-fans`) to avoid the `setActiveScreen` path-mapping redirect-loop bug class already hit once with `/news`→`/actualites` |
| 2026-07-18 | Fan Zone backend core kept minimal this phase (points ledger, one vote, ranking only); quizzes/missions/rewards/fan-wall stay client-side behind the new paywall |

## Risks Being Tracked

- Next 16 API drift vs training data — mitigate by reading bundled docs before each new API surface.
- `AppContext` god-object — club/media sections still use it; boutique state fully moved to API.
- External image URLs in seed data — Unsplash CDN URLs used for demo; production should host locally.
