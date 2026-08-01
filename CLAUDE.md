@AGENTS.md

# USM Digital Platform

Official digital platform for **Union Sportive Monastirienne (US Monastir / USM)** — a Tunisian club with
both a football and a basketball section. Built by Gemini Antigravity from a detailed product spec; this
file tracks the actual state of the codebase so future work stays consistent with what's really here
(see `NEXTSTEP.md` for the gap list against the original spec).

## Stack (as built, not aspirational)

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 (`@theme` tokens in `globals.css`), Framer Motion, lucide-react icons.
- **No backend yet.** Everything — matches, news, players, sponsors, orders, fan-zone state — lives in
  `src/data/mockData.ts` and is mutated only in-memory via `src/context/AppContext.tsx` (`useState`). Refreshing
  the page resets everything except `language`/`theme`, which persist to `localStorage`. There is no NestJS
  service, no PostgreSQL, no auth backend, no file storage, despite the original spec calling for them.
- Routing pattern: every file under `src/app/**/page.tsx` is a thin client-component wrapper that renders a
  matching view from `src/views/*.tsx`. Put real UI/logic in the view, not the route file.
- `AppContext` also mirrors the current route into an `activeScreen` string used by nav highlighting — when
  adding a new route, add it to the `ActiveScreen` union in `AppContext.tsx` too.

## i18n / RTL

- Three languages: `en`, `fr`, `ar`. Translation strings live in the `translations` object inside
  `AppContext.tsx` (not a separate i18n library) — add new keys there, not inline strings, and add all three
  language variants together.
- `setLanguage('ar')` flips `document.documentElement.dir` to `rtl`. When building new layout, use logical
  Tailwind properties (`ps-`/`pe-`/`start-`/`end-`) over `pl-`/`pr-`/`left-`/`right-` so Arabic doesn't break.
- Mock data models often carry parallel fields per language (`name` / `nameAr`, sometimes `titleFr`) rather
  than a lookup table — follow that existing pattern for new content rather than introducing a new i18n shape.

## Brand tokens

Defined in `src/app/globals.css`: `--color-usm-blue-primary` (#0D63FF), `--color-usm-blue-dark` (#020817),
`--color-usm-blue-secondary` (#06152B), `--color-usm-accent-gold` (#D4AF37). Fonts: Outfit (`--font-display`,
headings), Inter (`--font-sans`, body), Cairo (`--font-arabic`). Dark mode is the premium default; light mode
exists but dark is what most visual work targets.

## Known landmines — read before touching these

- **`src/components/Common/Logo.tsx` points at a hallucinated external URL**
  (`https://usmonastir.tn/wp-content/uploads/...`). It is not the real club crest and may not resolve at all.
  The user has the actual official logo file — it needs to be saved into `public/` and `Logo.tsx` switched to
  reference it locally (also update `homeLogo: '/logos/usm.png'` in `mockData.ts`, which points at a file that
  doesn't exist in `public/`).
- **The catalog has a real cart + checkout flow** (`AppContext` cart/order state, `Checkout.tsx`, the sliding
  cart drawer in `AppLayout.tsx`, "Add to Cart" buttons in `OfficialCatalog.tsx`/`ProductDetail.tsx`). The
  original spec explicitly forbids this: catalog actions must be **"Reserve via WhatsApp"**, **"Available in
  official store"**, or **"Contact the club"** only — no cart, no checkout, no online payment. This is the
  single biggest deviation from spec in the current build. See `NEXTSTEP.md` for the fix plan.
- No PWA manifest/service worker exists yet despite the spec calling for "Add to home screen" install prompts.
- No automated tests exist. Verify changes by running `npm run dev` and clicking through, not by assumption.

## Conventions to follow when extending

- Keep new pages as route-wrapper + view, matching existing structure.
- Add new mock entities to `mockData.ts` with the same shape/verbosity as existing entries (bilingual/trilingual
  fields, realistic Tunisian names/clubs/sponsors) rather than lightweight placeholders.
- Use the `useApp()` context hook for cross-cutting state instead of introducing new local/global state
  mechanisms.
- Don't add real payment/checkout code — the club explicitly does not want online transactions.
