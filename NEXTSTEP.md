# USM Platform — Next Steps

Status check against the original brief given to Gemini Antigravity. Frontend scaffold for all major sections
exists (see file list below); this is the prioritized gap list, most important first.

## 0. What already exists (don't rebuild)

Routes/views for: Home, Football, Basketball, Matches (Match Center), News (Newsroom), Media Gallery, Fan Zone,
Club History, Sponsors, Official Catalog + Product Detail, Boutique, Checkout, Stadium Guide, Academy, Press
Center. Shared: Header, Footer, MobileNav, Logo, AppLayout (preloader, search overlay, cart drawer), SiteChrome
(hides the public chrome on `/admin/*`). Global state + i18n (en/fr/ar) + dark/light theme via `AppContext.tsx`.
Tailwind v4 brand theme in `globals.css`. Realistic mock data for players, matches, news, sponsors, trophies,
quiz, standings.

A full multi-page **Admin Dashboard** now exists at `/admin/*`, with every module wired to real CRUD state —
see section 4 below before touching anything under `src/app/admin/`, `src/views/admin/`, or
`src/components/Admin/`.

## 1. Critical — spec violations / broken assets

- [x] ~~Remove the cart/checkout/payment flow~~ — **superseded.** A later, more detailed shop brief explicitly
      asked for a cart → 3-step checkout → confirmation *reservation* flow (still no online payment, no card
      entry — just "the store will call to confirm"). The cart/checkout UI was kept and redesigned instead of
      removed. `Reserve via WhatsApp` is still used for things that aren't real orderable line items:
      Supporter Packs and the "notify me" / "ask a question" CTAs on sold-out or in-stock products.
- [x] ~~Remove the Sign In button/login modal from the header~~ — done. Header now only shows a profile
      dropdown when already `isLoggedIn`; the user is building a single dedicated admin login at `/admin`
      separately. `AdminDashboard.tsx` / `AppContext`'s `login(email, role, name)` still assume the old
      multi-role demo flow — worth simplifying once the real `/admin` login exists.
- [ ] **Fix the logo.** `Logo.tsx` hotlinks a fabricated URL (`https://usmonastir.tn/wp-content/uploads/...`),
      and the same fake URL is duplicated in `AppLayout.tsx`'s preloader. Get the real USM crest file from the
      user, add it to `public/brand/`, and point both places at it via `next/image`. Also fix
      `homeLogo: '/logos/usm.png'` references in `mockData.ts`.
- [x] ~~Audit other external hotlinked images~~ — done for sponsors and boutique products. All 6 sponsor logo
      URLs were 404 (hallucinated Wikimedia hash paths), as were several product photos added in the boutique
      redesign pass. Every URL was verified with `curl` before being committed (see `[[feedback-verify-hotlinked-urls]]`
      going forward). Ooredoo/Tunisair/Macron/Sabrine now point at real, curl-verified Wikimedia files. BIAT and
      Délice Danone have **no real logo file anywhere on Wikipedia/Commons** — rather than guess again, added
      `SponsorLogo.tsx` (`src/components/Common/`), which renders the real image when available and falls back
      to a clean monogram badge otherwise (also guards against future broken URLs via `onError`). Used
      everywhere a sponsor logo renders: `Footer.tsx`, `Home.tsx` (match sponsor), `OfficialCatalog.tsx`
      (technical partner card), `SponsorHub.tsx`.
- [ ] Club/team crest logos (e.g. Espérance de Tunis, Club Africain in `matchesData`) still use broken/malformed
      Wikimedia thumb URLs (400s) — not fixed in this pass, same failure mode as the sponsor logos were.

## 2. Boutique redesign — done, and what's still deferred

The full shop UI/UX redesign brief (premium retail look, light canvas, product cards, PDP, cart, checkout) was
implemented: `ProductCard.tsx` (new, in `src/components/Shop/`), `OfficialCatalog.tsx` (landing: hero, new
arrivals, shop-by-collection, best sellers, matchday banner, limited edition + countdown, football/basketball
split, supporter packs, sponsor placement, supporter gallery, filterable all-products grid), `ProductDetail.tsx`
(gallery, color/size selectors, trust badges, 7-tab content, related products, mobile sticky add-to-cart), the
`AppLayout.tsx` cart drawer (premium empty state, reservation messaging), and `Checkout.tsx` (3-step flow +
animated confirmation with timeline). `CatalogItem` in `mockData.ts` grew badges/colors/collection/rank/stock/
gallery fields and now has 12 products + 3 supporter packs. A shared `wishlist` array landed in `AppContext`.

Deferred from that pass — worth doing before treating the shop as feature-complete:

- [ ] Dedicated category/collection **routes** (e.g. `/boutique/football`) with a full desktop sidebar +
      mobile drawer filter system (size, color, price range, gender, age group). Currently all filtering/sorting
      happens client-side on the single `/boutique` page via chips + a sort dropdown — good enough for this
      catalog size, not truly spec's per-category editorial pages.
- [ ] Color selection on the PDP is presentation-only — `addToCart`/`CartItem` don't carry a color, so a
      chosen color never reaches the cart or order summary. Extend `CartItem`/`Order` if color-specific
      inventory ever matters.
- [ ] Wishlist has no dedicated page and isn't persisted (`localStorage`) — it's just an in-memory id array used
      to color the heart icon.
- [ ] "Recently viewed" and "frequently bought together" from the spec weren't built — related products on the
      PDP are just same-collection items.
- [ ] Remaining empty/special states from spec section J (no search results, category with no products beyond
      the one grid, order cancelled, maintenance mode) aren't built; only empty cart and empty wishlist-adjacent
      (product not found) states exist.
- [ ] No coupon code field, no address autocomplete, no "add to calendar" for pickup — all explicitly mentioned
      in the spec as nice-to-haves.

## 3. Missing feature areas from the spec

- [ ] PWA: add `manifest.json`, icons, and install-prompt UI ("Add USM to your home screen") — spec section M.
- [ ] Per-page SEO metadata (`generateMetadata` per route for players, matches, news, sponsors) — currently
      only root `layout.tsx` has static metadata.
- [ ] Global search is UI-only over local mock arrays (`AppLayout.tsx`) — fine for now, but note it doesn't
      search products, sponsors, or stadium/academy content yet.
- [ ] Sponsor dashboard analytics (impressions/clicks/CTR charts, city/country breakdown, PDF export) — spec
      section 12. Current `sponsors` metrics update via a simulated click counter only; no chart UI yet.
- [x] ~~Press accreditation request form, academy trial/registration application form~~ — the **admin side**
      (review/approve/reject queues) exists now at `/admin/press` and `/admin/academy` (see section 4). The
      **public-facing submission forms** fans/journalists would actually fill out don't exist yet — `PressCenter.tsx`
      and `Academy.tsx` (public views) still don't POST into `accreditations`/`applications` state.
- [ ] USM TV video grid (durations, views, categories, hover-play) — check whether `MediaGallery.tsx` covers
      this or if it's photos-only. Admin-side media upload now exists at `/admin/media` (photos + videos by URL).
- [ ] "USM Around the World" diaspora map, digital supporter card, shareable posters — check Fan Zone coverage
      (note: a Fan Zone overhaul — missions, votes, fan wall, diaspora map, rewards, streaks — was being built
      concurrently in `AppContext.tsx`/`mockData.ts`/`FanZone.tsx` as of the admin dashboard rebuild below;
      confirm its state before assuming this is still unbuilt).

## 4. Admin Dashboard rebuild — done end-to-end, every module has real CRUD

The old single-page `/admin` (flat, dark-themed, one `AdminDashboard.tsx`) was replaced with a full multi-page
admin shell matching a detailed "complete digital command center" brief, then — in a follow-up pass — **every
remaining placeholder module was made genuinely functional** (no more `ModulePreview` stubs anywhere in the
sidebar). Deleted `views/AdminDashboard.tsx` entirely; everything it did was migrated forward.

**Architecture**: `src/app/admin/layout.tsx` renders `AdminShell` (`src/components/Admin/`: `AdminSidebar`
— collapsible, grouped, active-state nav from `adminNav.ts` — `AdminTopbar`, `AdminQuickCreate`,
`AdminPageHeader`, `StatCard`, `ModulePreview` [now unused but kept as a reusable pattern for future modules]).
`SiteChrome.tsx` makes the root layout skip the public `AppLayout` for any `/admin/*` path. Light workspace
(`bg-slate-50`, white cards, `usm-blue-primary` accent), distinct from the dark/gold public site.

**Data model**: `AppContext.tsx` now owns, with full CRUD + `logActivity()` calls, every admin domain:
`products`, `newsList`, `sponsors`, `matches`, `footballRoster`/`basketballRoster`/`staffRoster` (moved off the
static `mockData.ts` exports, same pattern as products/news — `Football.tsx`/`Basketball.tsx`/`Home.tsx`/
`AppLayout.tsx` search all read from context now), `mediaLibrary`, `trials`/`applications` (Academy),
`releases`/`accreditations` (Press), `notifications`, `clubSettings` (now wired live into `Footer.tsx`'s
address/phone/email/social links), `homepageSections` (wired live into `Home.tsx` — every one of its 9 sections
is individually wrapped in `{isSectionVisible('key') && (...)}`), `teamUsers`, and `auditLog` (real entries,
capped at 50, populated by nearly every mutator above — Dashboard home's "Latest Admin Activity" now reads this
instead of a static list). `News`/`CatalogItem` also gained optional `seoTitle`/`seoDescription` fields.

**Every sidebar module is now real** (add/edit/delete against the state above, not fake): Dashboard, Match
Center, Football, Basketball, Newsroom, Sponsors, Boutique, Orders, Media, Academy, Press Center, Notifications,
Settings, SEO, Pages, Users & Roles. Fan Zone has real comment moderation + a read-only quiz overview (voting/
quiz-authoring CRUD not built). Analytics mixes real numbers (sponsor impressions/clicks, order value, published
article count) with one clearly-labeled illustrative traffic chart.

Deferred from this pass:

- [ ] Real backend auth + the 10-role permission matrix enforcement (Users & Roles is a real, editable team-member
      list + a labeled reference matrix — but role changes don't actually restrict anything, no backend exists).
- [ ] Public-facing submission forms that feed the new Academy/Press admin queues (see section 3) — admins can
      review applications/accreditation requests, but nothing on the public site creates new ones yet.
- [ ] Fan Zone: votes/quiz-authoring CRUD, supporter badges management, fan wall beyond comment approve/reject.
- [ ] Add-match form only covers core fields (sport/competition/teams/date/venue) — no formations, lineups,
      or bilingual team-name entry (defaults AR copy to the EN string). Same simplification on add-player forms
      (2 free-text stat slots rather than sport-specific stat schemas) and add-sponsor forms (English-only story
      text, no French/Arabic entry).
- [ ] `Pages` admin only controls homepage section visibility (show/hide, no reordering, no per-section content
      editing) — not the full "edit hero text/images/CTAs" page builder from the original spec.
- [ ] `SEO` admin only covers News + Boutique products (title + meta description) — not matches, players, or
      sponsors, and nothing is wired into actual `<head>` metadata yet (still just data fields, no
      `generateMetadata` consumption — see section 3).

## 5. Backend decision needed

Everything is currently client-side mock state (resets on refresh). Before investing more in frontend polish,
decide: is this staying a **frontend-only prototype/demo** for stakeholders, or does it need the real
NestJS + PostgreSQL + auth + media storage backend from the spec's tech stack? That decision changes priority
of items above (e.g. admin roles and sponsor dashboards are pointless to harden further without persistence).

## 6. Content scale-up (once direction above is confirmed)

- Expand mock data: more than 5 football / 4 basketball players, more news articles, full-league standings,
  more matches/results history, more catalog products — spec wants the site to feel "alive," current data is a
  thin demo set.
- Verify Arabic RTL rendering end-to-end (not just `dir` flip) across Match Center stats, tables, and cards.
