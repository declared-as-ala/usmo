# Implementation Prompt — Fan Accounts, Abonnement, Fan Zone Paywall, Premium Media, Donations

> Copy everything below this line into a fresh session with your implementation AI tool of
> choice. It is self-contained: it does not assume the tool has read anything else in this repo
> first, though it should still read the two docs referenced in step 0.

---

You are a senior full-stack engineer working on the official US Monastir (Union Sportive
Monastirienne) digital platform monorepo. Stack: **Next.js 16 App Router + TypeScript + Tailwind
CSS v4** (`apps/web`), **NestJS + TypeScript + Mongoose** (`apps/api`), **MongoDB**, **MinIO**
object storage. No mock data is allowed in the final application — every public page must be
backend-driven.

## Step 0 — read first

- `docs/fan-membership.md` — the full behavioral specification (access levels, membership state
  machine, Fan Zone paywall states, media access rules, donation privacy rules). This is the
  source of truth for *what* to build.
- `docs/database.md` (search for "Fan accounts, membership, media access & donations"),
  `docs/api.md` (search for "Fan Accounts, Membership, Fan Zone, Media Access & Donations"), and
  `docs/security.md` (§2b) — schema field lists, endpoint tables, and the RBAC/guard rules that
  extend this repo's *actual* auth system.

Do not re-derive these from scratch — they were produced by exploring the real codebase this
session. The rest of this prompt gives you the verified current-state facts and gotchas that
made those docs correct; treat them as ground truth.

## Verified current-state facts (do not re-verify — build on these)

**Auth is hand-rolled, not Passport/Auth.js.** `apps/api/src/modules/auth/`:
- `POST /api/auth/login` sets an HttpOnly `jwt` cookie (7 days, `sameSite: 'lax'`) **and** returns
  `{ access_token, user }` in the body.
- `GET /api/auth/me` returns the **raw decoded JWT payload** (`{ email, sub, role, name, iat, exp }`),
  not a fresh DB read.
- **There is no register endpoint and no refresh endpoint.** You must add `POST /api/auth/register`.
- `JwtAuthGuard` (`jwt-auth.guard.ts`) reads the cookie first, falls back to a `Bearer` header,
  verifies with `JWT_SECRET`, sets `request.user = payload`. It is a plain class using
  `JwtService` directly — no `PassportStrategy`.
- `RolesGuard` + `@Roles(...)` decorator do a flat string match against `request.user.role` —
  **no role hierarchy**. Every guarded endpoint lists every accepted role explicitly, e.g.
  `@UseGuards(JwtAuthGuard, RolesGuard) @Roles('Admin', 'Super Admin')`. Follow this exact pattern
  for new endpoints; do not invent a different guard style.

**User schema is minimal today.** `apps/api/src/modules/users/user.schema.ts`:
```ts
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true }) name: string;
  @Prop({ type: String, required: true, unique: true, index: true }) email: string;
  @Prop({ type: String, required: true }) password?: string;
  @Prop({ type: String, required: true, default: 'Customer' }) role: string;
  @Prop({ type: String, required: true, default: 'Active' }) status: 'Active' | 'Inactive';
}
```
`role` is a free-form string (no enum) — add `'Fan'` as a value, no migration needed. Password
hashing (bcryptjs, cost 10) happens **only** inside `UsersService.create` — route any new
user-creation code through it (or replicate the exact hashing call) rather than hashing
ad hoc. There is currently **no users controller at all** (no HTTP surface on `UsersService`).

**Storage is 100% admin-gated.** `apps/api/src/modules/storage/storage.controller.ts` is
class-decorated `@Controller('admin/storage') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Admin',
'Super Admin')`. Fans cannot call it. For fan-scoped uploads (avatar, donation proof), create
**new** endpoints in your new modules that inject the exported `StorageService` directly
(`StorageModule` exports it) and call `uploadFile(buffer, name, mime, folder, uploadedBy?, meta)`.
Known bug to avoid repeating: the existing admin controller reads `req.user?.userId` for
`uploadedBy`, but the JWT payload's id field is `sub` — always read `req.user.sub`.
`FOLDERS` constants (`apps/api/src/modules/storage/constants/upload.constants.ts`) already
include `USERS = 'users/avatars'` and `FAN_ZONE = 'fan-zone'`; add `DONATIONS = 'donations'`.

**Patterns to clone exactly, don't reinvent:**
- *Request → admin-approve flow* = `apps/api/src/modules/orders/` (schema with `status` enum +
  `statusHistory: [{status, at, by, note?}]` subdocs, service with `updateStatus` pushing
  history, controller with public `create` + admin-guarded list/status-update/delete). **Caveat:**
  Orders' backend does *not* enforce a transition state machine (the frontend's `STATUS_NEXT`
  object does) — your Membership and Donation services **must** enforce transitions server-side,
  since a bad status flip here is a real access-control bug, not just a UX inconsistency.
- *Singleton config document* = `apps/api/src/modules/settings/settings.service.ts`'s
  `getHomepage()`/`updateHomepage()`: `key`-discriminated document,
  `findOneAndUpdate({key}, {$setOnInsert:{key, ...defaults}}, {new:true, upsert:true,
  setDefaultsOnInsert:true})`. Use this exact call shape for `DonationSettings`.
- *Canonical backend-connected admin page* = `apps/web/src/views/admin/AdminOrders.tsx`:
  `useCallback` loader calling the api-client, debounced filter/search effect, `<AdminPageHeader>`
  + `<StatCard>` grid, status-pill table, transition buttons calling `api.updateXStatus` then
  reloading. Clone this shape for `AdminMemberships.tsx` and `AdminDonations.tsx`.
- Standalone seed scripts (not full Nest bootstrap) = `apps/api/src/seed-news.ts` /
  `seed-heritage.ts` (`import 'dotenv/config'; mongoose.connect(process.env.MONGODB_URI)`).
  Use this style for membership-plan and media-migration seeds, not `seed.ts`'s
  `NestFactory.createApplicationContext`.

**Frontend auth is presently dead code.** `apps/web/src/context/AppContext.tsx` has
`isLoggedIn`/`username`/`userRole` state and a `login()` function that **is never called anywhere
in the codebase** — it's a stub. `Header.tsx` already has a complete profile-dropdown UI (~lines
246–317) that never renders because `isLoggedIn` is permanently `false`. Your job: replace the
stub with a real flow (call `GET /api/me` on mount, expose the fan user object, wire real
login/logout), which will make that dropdown come alive — you do not need to redesign it, just
connect it. `Checkout.tsx` already prefills the name field from `username` if `isLoggedIn` — don't
break that. Admin auth (`components/Admin/AdminShell.tsx`) is a **separate, working** system —
don't touch it, don't merge it with fan auth.

**Fan Zone is 100% client-side today**, route `apps/web/src/app/fanzone/page.tsx` →
`views/FanZone.tsx`. Points (`bluePoints`, init `150`, `useState` in AppContext, not persisted),
missions/leaderboard/poll are hardcoded module constants, match/roster data is separate
AppContext mock state. **Do not rename the route** — `/fanzone` must stay `/fanzone`. This
codebase's `AppContext.setActiveScreen()` maps a screen name to `/` + that name, and a sync effect
in `AppLayout.tsx` maps the URL back to a screen name; when a route's real path didn't equal its
screen-name (e.g. `/news` is a redirect shim for the real `/actualites` route), it produced an
infinite redirect loop that had to be specifically patched. Adding a *new* screen name is fine as
long as path === `/screenname`; renaming `fanzone` risks recreating that exact bug class.

**USM Media is 100% client-side today.** `MediaAlbum`/`MediaVideo`/`MediaPhoto` interfaces live in
`apps/web/src/data/mediaMockData.ts`, seeded into `AppContext` state; `MediaGallery.tsx`,
`AlbumDetail.tsx`, `VideoDetail.tsx` read only from `useApp()`. No `accessLevel` field exists
anywhere yet — the only existing restriction concept is per-item `downloadEnabled` (download
gating, not view gating). There's a **separate, unrelated** backend admin media library
(`MediaFile` in the storage module, used by the `MediaUploader`/`MediaLibrary` admin components)
— don't confuse it with the public galleries you're migrating.

**Global gotchas:**
- `apps/api/src/main.ts`'s `ValidationPipe` has `forbidNonWhitelisted: true` — every DTO must
  declare every field it accepts, or the whole request 422s.
- `@nestjs/throttler` is an installed dependency but **wired nowhere** — you must add
  `ThrottlerModule` to `app.module.ts` and apply it to register/donation-submit/membership-request.
- No backend audit-log or notifications module exists at all today (admin's "Latest Activity"
  feed is `AppContext`-only). This feature introduces a minimal `auditlogs` collection — see
  `database.md`.
- `usm-web` and `usm-api` run as **production Docker builds** (`docker compose --profile full`),
  not live dev servers — after implementing each phase, rebuild
  (`docker compose --profile full build web api && docker compose --profile full up -d`) before
  expecting to see changes at `localhost:3000`/`localhost:3001`.
- Design system: reuse the existing `usm-premium-bg` / `usm-card` / `usm-btn-primary` /
  `usm-btn-secondary` CSS utility classes (`apps/web/src/app/globals.css`) and the gold/navy
  design tokens already defined there — do not invent a new visual language for auth/paywall
  pages. Public-facing copy is French-first; use the existing `tr(language, en, fr, ar)` helper
  from `apps/web/src/utils/i18n.ts` for new bilingual strings, matching how recent pages
  (Footer, Match Center, Histoire, Palmarès) were built.

## Phased work plan

Implement in this order; each phase should typecheck clean (`npx tsc --noEmit` in both
`apps/web` and `apps/api`) and pass an ESLint pass before moving to the next. Update
`docs/progress.md` with a dated "Done" entry (matching its existing format) at the end of each
phase — don't wait until everything is finished.

### Phase 1 — Fan auth + accounts

Backend (`apps/api/src/modules/`):
- Extend `user.schema.ts` with the fields listed in `database.md`'s "users (extended)" table.
- `auth/`: add `POST /api/auth/register` (DTO with `firstName, lastName, email, phone?, password,
  city?, country?, favoriteSport?, favoritePlayer?, acceptTerms, newsletterOptIn?`, role forced to
  `'Fan'` server-side — never accept role from the client).
- New `users` HTTP surface (or extend the existing service): DB-backed `GET /api/me`,
  `PATCH /api/me/profile`, `PATCH /api/me/privacy`, `POST /api/me/avatar`.
- Wire `ThrottlerModule` in `app.module.ts`; apply to register.

Frontend (`apps/web/src/`):
- `app/auth/login/page.tsx`, `app/auth/register/page.tsx` (premium design, not a generic form).
- `app/compte/layout.tsx` + `app/compte/page.tsx`, `app/compte/profil/page.tsx` (profile edit +
  avatar upload + privacy toggles).
- Replace the `AppContext` auth stub: on app mount, call `api.getMe()`; expose `{fan, refreshMe,
  loginFan, logoutFan}`; wire `Header.tsx`'s existing dropdown to real state (it already has the
  markup — connect it, add a "Mon compte" link to `/compte`).
- `api-client.ts`: add `register`, and update `getMe`/token handling if the response shape changes.

Verification: register → login → `GET /me` round-trip via curl; Header dropdown appears after
login; Checkout still prefills name correctly; guest checkout still works unauthenticated.

### Phase 2 — Membership / Abonnement

Backend:
- `membership-plans/` module (schema + admin CRUD + public `GET /membership/plans`).
- `memberships/` module: schema per `database.md`, service enforcing the transition table from
  `fan-membership.md` §2 (reject invalid transitions with a typed error), `GET /me/membership`
  (lazy-expire on read), `POST /me/membership/request`, admin approve/reject/renew/suspend/cancel
  endpoints.
- New `RequireActiveMembership` guard (export it — Phase 3 depends on it).
- Seed script: 5–7 starter plans (see names in `fan-membership.md` §2).

Frontend:
- `/abonnement` page: plan cards, request flow, "my membership" status card.
- `views/admin/AdminMembershipPlans.tsx`, `views/admin/AdminMemberships.tsx` (clone
  `AdminOrders.tsx`'s pattern) + route wrappers + `adminNav.ts` entries (new "Membership" group or
  extend "Community").
- Membership summary card in `/compte`.

Verification: request a plan as a fan → approve as admin with dates → `/me/membership` reflects
`active` + correct `daysRemaining`; manually backdate an `endDate` in Mongo and confirm the next
`/me/membership` read flips it to `expired`.

### Phase 3 — Fan Zone paywall + premium media migration

Backend:
- `fan-zone/` module: `fanpoints` ledger + `GET /fan-zone/dashboard`, `fanvotes`/`fanvoteentries`
  + `GET /fan-zone/votes/active` (public) + `POST /fan-zone/votes/:id/vote` (⭐), `GET
  /fan-zone/ranking` (privacy-filtered).
- `media/` module (new — do not confuse with the existing `storage` admin media library):
  `mediaalbums`/`mediavideos` schemas per `database.md`, `OptionalJwtAuthGuard`, public list/detail
  endpoints returning the locked-teaser shape from `fan-membership.md` §4, admin CRUD with
  `accessLevel` field.
- One-off migration script: read `apps/web/src/data/mediaMockData.ts` exports, insert into the
  new collections with `accessLevel: 'public'`.

Frontend:
- `FanZone.tsx`: wrap in the 3-state resolver (visitor teaser / registered-locked / active-member
  full); wire points/vote/ranking sections to the new endpoints; leave missions/quiz/badges/
  fan-wall/poster-generator as-is (client-side) per the non-goals list.
- `MediaGallery.tsx`, `AlbumDetail.tsx`, `VideoDetail.tsx`: switch from `useApp()` mock arrays to
  API calls; add the locked-card component (blurred cover + lock icon + "Réservé aux abonnés" +
  CTA) used everywhere album/video cards render.
- Admin media views: point at the new backend endpoints; add an `accessLevel` select to the
  edit forms.

Verification: as a visitor, `/fanzone` shows the teaser and `/media` shows public items fully +
locked previews for anything marked `registered`/`members`; as an active member, `/fanzone` shows
the full dashboard and locked media becomes viewable; confirm a direct `curl` to a `members`-level
album detail endpoint without a token returns the teaser shape, not a 401/500.

### Phase 4 — Donations

Backend:
- `donations/` module: `Donation` + `DonationSettings` (singleton, settings-module pattern)
  schemas, `POST /donations` (throttled), `POST /donations/:id/proof` (fan-scoped upload, new
  `DONATIONS` folder constant), `GET /me/donations`, `GET /donations/leaderboard` (privacy rules
  applied server-side, confirmed-only), admin confirm/reject/visibility/reports endpoints, admin
  settings endpoints.
- Minimal `auditlogs` collection + write from every membership and donation admin action (both
  phases 2 and 4 — retrofit phase 2 if not already added).

Frontend:
- `/support-usm` (or `/dons` — pick one and use it consistently) donation page: hero, amount
  cards, purpose selector, privacy choice, proof upload, confirmation state.
- Leaderboard component: top-3 podium + month/season/all-time tabs + anonymous-count line.
- `/compte/dons` history, `views/admin/AdminDonations.tsx`, `views/admin/AdminDonationSettings.tsx`
  + adminNav entries.

Verification: submit a donation as a fan with `showAmount: false` → confirm as admin → verify
the leaderboard shows a level badge, not the amount, for that row; submit another with
`showAmount: true` but with the admin's `showExactAmounts` off → still hidden (two-gate rule);
only `confirmed` donations ever appear outside the admin queue.

## Acceptance criteria (condensed from the original spec — full detail in `fan-membership.md`)

- Fans can register/login/logout, edit profile + privacy settings, see a working `/compte`.
- Admin can create/edit/delete membership plans; fans can request; admin can
  approve/reject/renew/suspend/cancel; active membership genuinely unlocks ⭐ content; expired
  membership genuinely blocks it (server-enforced, verified by direct API calls, not just UI).
- `/fanzone` shows the correct one of 3 states based on real auth/membership status; visitor and
  locked states are polished, not error pages.
- Public media is visible to everyone; `registered`/`members` media is locked with a real
  server-side check; admin controls access level per item.
- Fans can submit donations; admin confirms/rejects; only confirmed donations count; leaderboard
  respects the two-gate privacy rule; donation badges compute correctly from thresholds.
- No mock data remains for anything migrated in this feature (media galleries, Fan Zone points/
  vote/ranking). Missions/quiz/rewards/fan-wall staying mock is an accepted, documented gap — not
  an oversight.
- Zero TypeScript errors in either app; no new ESLint errors (pre-existing warnings elsewhere in
  the codebase are out of scope to fix); no broken buttons; backend is the actual enforcement
  point everywhere access matters.
