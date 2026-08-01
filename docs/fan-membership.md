# Fan Accounts, Abonnement, Fan Zone Paywall, Premium Media & Donations

> This spec targets the **actual implementation stack** (NestJS + Mongoose under `apps/api`,
> Next.js App Router under `apps/web`) — not the aspirational server-actions architecture
> described in the rest of `docs/`. Where conventions differ, this file wins for this feature.
> No online payment provider is integrated in this phase. Every money-adjacent flow (membership,
> donations) is **manual**: a fan submits an intention, an admin confirms it. The data model is
> shaped so a payment provider can be dropped in later without a schema rewrite.

## 1. Access levels

Three levels, checked **server-side** on every protected endpoint (frontend hiding is UX only,
never the security boundary).

| Level | Definition | Can access |
|---|---|---|
| **Visitor** | No session | Home, news previews, boutique, public sponsors, public match results, public palmarès/history, `/auth/login`, `/auth/register`, Fan Zone teaser, USM Media teaser (public items + locked previews of premium items) |
| **Registered Fan** | Logged in, `role: 'Fan'`, no active membership | Profile/account pages, order history, donation page, abonnement page, any votes/media admin explicitly marks `registered`-level, limited Fan Zone/Media teaser |
| **Active Member** | Logged in **and** an active `Membership` (see §2) | Everything above, plus full Fan Zone, digital supporter card, votes, ranking, premium/`members`-level USM Media, donation leaderboard, member-only content |

A user is "active member" iff they have at least one `Membership` document with
`status: 'active'` **and** `endDate >= now`. Expiry is lazy: read paths that check membership
status must first flip any stale `active` row whose `endDate` has passed to `expired` (see §2).

## 2. Membership / Abonnement system

### Mode (this phase)

**Manual only.** Fan requests a plan → admin approves with a start/end date → fan becomes
active. No payment gateway call anywhere. The `Membership` schema still carries a `source`
field (`'manual' | 'online'`, default `'manual'`) and status values chosen so a future payment
webhook can create/activate memberships without a schema migration.

### Statuses

`pending | active | expired | cancelled | suspended | rejected`

Transition rules (enforced in the service, not just the frontend — the existing `orders` module
does **not** enforce transitions server-side; this module must, since membership state gates
paywalled content):

- `pending → active` (admin approve, sets `startDate`/`endDate`)
- `pending → rejected` (admin reject)
- `active → expired` (system, lazy on read, or a scheduled job later)
- `active → suspended` (admin, e.g. abuse) / `suspended → active` (admin reinstate)
- `active → cancelled` (admin or self-service cancel — self-service not required this phase)
- `expired → active` (admin renew — creates a fresh `startDate`/`endDate` on the same document
  or a new document; pick **new document per renewal** for a clean history, referencing the
  previous one via `renewedFrom`)
- Any other transition is rejected with `INVALID_MEMBERSHIP_TRANSITION`.

### Plans (admin-managed, no hardcoded list)

Starter plans to seed (admin can add/edit/delete freely afterward): Fan Standard, Fan Premium,
Fan Gold, Diaspora Fan, Family Pack, Student Fan, VIP Supporter — see field list in
`database.md`. Plans carry `benefits: string[]` (freeform bullet strings shown on the plan card,
not individually machine-enforced this phase — access enforcement is by membership *status*,
not by *which plan*, except where §4/§6 explicitly says plan-specific).

### Fan-facing membership summary

`GET /api/me/membership` returns the fan's current/most-recent membership with:
`plan`, `status`, `startDate`, `endDate`, `daysRemaining` (computed), `benefitsUnlocked`
(the plan's `benefits` array), `renewalCta: boolean` (true when `status in [expired, cancelled]`
or `daysRemaining <= 7`).

## 3. Fan Zone paywall

Route stays **`/fanzone`** (do not rename to `/zone-fans` — the `AppContext.setActiveScreen`
path-mapping has a known redirect-loop failure mode when a route name doesn't match its
`ActiveScreen` union key 1:1; renaming risks reintroducing that class of bug, see the
`/news` → `/actualites` incident already fixed in this codebase).

Three render states on the same route, resolved client-side from the auth/membership state
fetched via `GET /api/me` + `GET /api/me/membership`, but the **data each state can fetch**
is separately guarded server-side:

1. **Visitor (not logged in)** — premium landing/teaser: explains what members unlock, shows a
   sample (non-interactive) supporter card, sample badges, a sample vote UI (disabled), a
   blurred media preview. CTAs: "Créer mon compte", "Découvrir les abonnements".
2. **Registered, no active membership** — locked-benefits page: same visual language as the
   teaser but framed as "you're almost there" with CTA "Activer mon abonnement" → `/abonnement`.
   May show real profile data (name, points-to-date if any) but not vote/predict/media.
3. **Active member** — full experience: existing `FanZone.tsx` sections (missions, vote center,
   quiz, ranking, badges, rewards, fan wall, supporter card, poster generator, "USM Around the
   World", donation leaderboard widget) wired to real data where a backend core exists (see
   below), otherwise remaining client-only for this phase.

### Minimal backend core for this phase (everything else stays client-side)

- **FanPoints ledger** — every points-earning action writes an append-only entry; `GET
  /api/fan-zone/dashboard` returns the fan's running total (replaces the current
  `bluePoints: useState(150)` stub in `AppContext`).
- **One vote type: Player of the Match** — a single active poll at a time (admin sets it via the
  existing match-adjacent admin surface or a simple toggle — out of scope to design a full
  polls-admin this phase), one vote per fan per poll, guarded by `RequireActiveMembership`.
- **Fan ranking** — `GET /api/fan-zone/ranking` aggregates `FanPoints` per user, sorted desc,
  respecting each fan's `privacySettings.showRanking` (excluded fans are omitted, not shown
  anonymized — ranking position for others should not shift oddly, so exclusion happens at the
  *display* layer: query returns everyone, frontend/service filters `showRanking === false`
  rows before assigning display rank).

Quizzes, missions, badges-as-unlockable-content, rewards catalog, fan wall submissions, and the
supporter-poster generator remain **client-side / AppContext-driven** this phase — do not build
backend modules for them yet. Note this explicitly as a known gap, not silently.

## 4. USM Media — premium access control

Today `MediaAlbum`/`MediaVideo`/`MediaPhoto` live only in `apps/web/src/data/mediaMockData.ts`,
seeded into `AppContext` state, with **no access-level concept** (only a `downloadEnabled`
gate). This phase migrates the public galleries to a real backend module.

### Access levels (per album, per video — not per photo; photos inherit their album's level)

`public | registered | members` — a fourth `plan-specific` level (via `allowedPlanIds: string[]`)
is modeled in the schema now but does not need a UI this phase; treat any album/video with
non-empty `allowedPlanIds` as `members`-level for enforcement purposes until plan-specific UI
ships.

### Public list behavior (teaser, never a 403 wall)

`GET /api/media/albums` and `GET /api/media/videos` return **every published item regardless of
access level**, but strip sensitive fields for items the caller can't access:

- `public` items → full payload.
- `registered`/`members` items, caller ineligible → payload keeps `title`, `slug`, `coverImage`/
  `thumbnail`, `category`, `sport`, `date`, and adds `locked: true`; strips `photos[]` /
  `videoUrl` and any detail fields.
- Detail endpoints (`GET /api/media/albums/:slug`, `GET /api/media/videos/:slug`) for a locked
  item return the same teaser shape (never a hard error) so the frontend can render a
  "Réservé aux abonnés" detail page with a CTA, not a broken page.

Auth on these public endpoints is **optional** — a lightweight "attach user if a valid token is
present, otherwise proceed as visitor" guard (do not reuse `JwtAuthGuard` as-is, since it throws
on a missing/invalid token; add an `OptionalJwtAuthGuard` variant that swallows the failure).

### Locked card UI (frontend)

Blurred cover image, centered lock icon, label "Réservé aux abonnés", CTA "Devenir abonné" →
`/abonnement`. Applied wherever album/video cards render (gallery grids, related-media rails).

### Admin

Existing admin media views migrate from `AppContext` CRUD to the new backend endpoints; add an
`accessLevel` select (public/registered/members) to the album/video edit forms. A dedicated
`/admin/media/access` bulk view is optional this phase — inline control on the existing edit
forms satisfies the acceptance criteria.

## 5. Donation system

### Flow (manual only)

Fan (must be logged in — donations are tied to a fan account for history/leaderboard/badges)
submits: amount (TND, stored as integer millimes per repo convention), purpose, method
(`bank_transfer | cash_at_club | manual_mobile`), optional proof image upload, optional message,
and **display preferences** (see privacy below). Status starts `pending`. Admin reviews (sees
proof image if provided) and confirms or rejects. **Only `confirmed` donations count anywhere**
— history, leaderboard, badge thresholds. `rejected`/`cancelled` are terminal; `refunded` exists
in the enum for a future online-payment phase but nothing produces it yet.

### Privacy — hard rule, enforced server-side

A donation is only shown with a real name/nickname and/or an exact amount if **both**:
1. the fan opted in at submission time (`displayNameMode: 'fullName' | 'nickname' | 'anonymous'`,
   `showAmount: boolean`), **and**
2. the admin's global `DonationSettings.showExactAmounts` allows amounts to be shown at all.

If either condition fails, the leaderboard shows a **level badge instead of the amount**
(Bronze/Silver/Gold/Legend Supporter, thresholds admin-configurable in `DonationSettings`) and/or
"Supporter anonyme" instead of a name. Pending donations are never counted or shown anywhere
outside the admin donations queue.

### Donation page (`/support-usm` or `/dons` — pick one, document the choice in the
implementation prompt's phase-4 section)

Sections: emotional hero ("Soutenez l'US Monastir"), suggested amount cards (10/20/50/100 TND +
custom), purpose selector (club support, youth academy, basketball section, football section,
infrastructure, media development, supporters initiative — admin-editable list via
`DonationSettings.purposes`), donor display choice, message field, manual payment instructions
(bank details from `DonationSettings`), proof upload (only required if
`DonationSettings.proofRequired`), submit → confirmation state.

### Leaderboard

`GET /api/donations/leaderboard?range=month|season|allTime` — confirmed donations only,
aggregated per fan, sorted desc, privacy rules applied per row as above. Top-3 podium styling on
the frontend; tabs for the three ranges; an "anonymous supporters" count shown separately from
the ranked list. Admin can globally disable the leaderboard (`DonationSettings.leaderboardEnabled
= false`) — in that case the route still exists but returns an empty/disabled response, and the
frontend shows nothing rather than an error.

### Donation badges

Computed from confirmed-donation history against `DonationSettings.badgeThresholds` (e.g. First
Donation, Loyal Supporter = N+ confirmed donations, Gold Donor = total ≥ threshold, Academy
Supporter = has a confirmed donation with `purpose: 'youth_academy'`, etc.) — compute on read
(no separate cron/materialized badge table needed this phase; keep it simple).

## 6. Explicit non-goals for this phase

Do **not** build in this phase (call these out if a downstream implementer starts scope-creeping):

- Any real payment gateway integration (Stripe/Flouci/Konnect/etc.) — schemas are payment-ready,
  nothing calls out to one.
- Backend modules for quizzes, missions, rewards catalog, fan wall, supporter-poster generator —
  these stay exactly as they are today (client-side/AppContext) behind the new paywall gate.
- Plan-specific media UI (the `allowedPlanIds` field exists in the schema but has no admin/public
  UI yet — anything with a non-empty list is simply treated as `members`-level).
- A general-purpose backend notifications system beyond the specific membership/donation
  confirmation notifications called out in `api.md` — no notification center, no push/email
  delivery infrastructure.
- Self-service membership cancellation or plan changes from the fan side (admin-driven only).
- A full polls/predictions admin CRUD — the one "player of the match" vote is manually toggled by
  an admin using the simplest mechanism available (a single "active poll" pointer is enough).
