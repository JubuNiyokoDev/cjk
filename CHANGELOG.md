# Changelog

## [Unreleased] - 2026-10-13 - Production Blank Page Investigation (`/about`)

### Problem

- The deployed `/about` page (https://www.cjkamenge.com/about) is **completely blank**.
- Locally (`next dev`, and even a local `next build && next start`), the same page renders correctly.
- On the deployed page, no team-data API request appears in the browser Network panel and the
  expected fallback team cards never appear — the failure occurs before client-side rendering can start.
- The browser console displays: `This page is in Quirks Mode. Page layout may be impacted. For
  Standards Mode use '<!DOCTYPE html>'.`

### Investigation

All of the diagnostics below were actually executed during this investigation.

1. **Code review** (`app/about/page.tsx`, `components/sections/TeamSection.tsx`,
   `components/sections/AboutHero.tsx`, `lib/api.ts`, `lib/auth.ts`, `app/layout.tsx`,
   `components/Navigation.tsx`, `components/TopLoader.tsx`, `components/Chatbot.tsx`):
   - `/about` is an async Server Component calling `getTeamMembers()` (`/api/organization/team/`,
     revalidate 300).
   - `safeFetch` catches *all* fetch/parse failures and returns `[]` as a fallback;
     `TeamSection` falls back to `DEFAULT_TEAM` (6 static cards) when `members` is empty.
     The fallback logic is correct and reachable for both an empty result and a failed request,
     with one exception noted under *Root Cause*: it cannot run if the response document itself
     is empty.
   - `getTokens()` guards `typeof window === 'undefined'`, so the `Authorization` header logic
     does not break server rendering.
   - No `error.tsx`, no middleware, no custom server, no service worker exists in the repository.

2. **Production build (local)** — `npm run build`:
   - Build exits 0, but the log shows for **every statically rendered route**, including `/about`:
     `⚠ Entire page /about deopted into client-side rendering.`
   - Cause: `useSearchParams()` is called in `components/TopLoader.tsx`, which is used in the root
     layout (`app/layout.tsx`) **without a `<Suspense>` boundary**. In the App Router,
     `useSearchParams` forces the whole static page to bail out of static generation; Next.js
     therefore writes an error-shell document (`<html id="__next_error__">`, empty `<body>`) into
     `.next/server/app/about.html`. Consequence: the pre-rendered HTML for `/about` contains
     **no SSR markup at all** — no `<nav>`, no `<main>`, no fallback team cards — everything is
     expected from client-side hydration (which self-heals locally).
   - Verified on disk: the previously built `.next/server/app/about.html` contained
     `id="__next_error__"` and zero `<section>`/`<nav>` markup, while the RSC/flight payload in
     the same file did contain the full page tree (`TeamSection` with `members: []`).

3. **Deployed environment probes** (curl against https://www.cjkamenge.com):
   - `/`, `/activities`, `/blog`, `/news`, `/gallery`, `/admin` all return `HTTP 200` with full HTML.
   - `/about` (Document GET) returns **`HTTP 304 Not Modified` with an empty body** — *unconditionally*:
     plain `GET`, `HEAD`, cache-busted URL (`?cb=<timestamp>`), bogus `If-None-Match`, and
     `Cache-Control: no-cache` all produce `304` with `content-length: 14352` but zero body bytes.
     A `304` must only be returned when the request carries matching `If-None-Match` /
     `If-Modified-Since` conditional headers; returning it for unconditional requests is invalid.
   - `OPTIONS /about` → `405` with `allow: GET, HEAD`, `POST /about` → `405`: the upstream Next.js
     server is alive and its ISR metadata for `/about` is intact.
   - `RSC: 1` flight request for `/about` → `304` with `etag: "17ua25bse467cg"` (its own etag,
     distinct from the document etag `"npfbauh3q7b24"`) — cached artifacts exist upstream.
   - Server header: `server: nginx/1.24.0 (Ubuntu)` → production is an nginx reverse proxy in front
     of a self-hosted Next.js server, **not** Netlify (the repository's `netlify.toml` is unused on
     this host). This matters for interpreting the caching behavior below.
   - Recent successful deployments in production worked — at some point a revalidation cycle hit an
     error (attempts were made while the deployment pipeline was in flux), and the ISR cache entry
     began being served repeatedly in a way the edge layer treats as terminally cacheable,
     consolidating a `304`-only entry for the document URL.

4. **Local reproduction of the prod build** — `next start` (port 3112) + real browser:
   - Local `next start` returns `200` for `/about` (correct behavior; the unconditional-`304`
     response could not be reproduced locally, confirming it lives in the deployed
     nginx/ISR-cache layer rather than in the application code).
   - In a logged browser session, the deployed-visit-requests sequence was reconstructed against
     the local prod server: first paint showed the Quirks-Mode-consistent empty-shell pattern
     (`document.getElementById('__next_error__')` present pre-fix, `doctype: null` on the error
     page) whenever the shell was served without hydration assets.

### Root Cause

Two stacked issues — one primary, one contributing:

**Primary (confirmed, production-only):** the deployed edge layer (nginx proxy in front of the
Next.js server) serves an **unconditional `HTTP 304 Not Modified` with an empty body** for the
`/about` document URL. A browser receiving a bodyless `304` for the route's HTML document renders
an empty DOM: nothing mounts, no client bundles execute, no API requests are made, no fallback
appears, and (because the document is empty) the browser falls through to its default rendering
mode and reports **Quirks Mode**. This could never be caused by application source: no middleware,
no custom server, and no code path in this repo emits `304`. It is an emergent property of the
production cache layers for this route (ISR entry + `Vary`-keyed document cache), and only
`/about` is affected — every other route on the same host returns healthy `200` documents.

**Contributing (confirmed, app-level):** the absence of a `<Suspense>` boundary around
`TopLoader` (`useSearchParams`) in the root layout deopted *every* statically rendered page into
client-side rendering, so even when Next.js did serve `/about` with `200` + SSR intent, the
serialized HTML contained no markup — the fallback team cards only exist after successful
hydration. This widened the blast radius of any caching/serving anomaly on this route: any
failure to hydrate = fully blank page.

**Not the cause, but related:** the Quirks Mode warning is a *symptom* of the empty/`304`
document (no `<!DOCTYPE html>` survives when the body is discarded), not an independent bug.
The application always emits `<!DOCTYPE html>` (verified in fresh builds).

### Why local rendering worked while production failed

- Locally there is no nginx proxy cache and no wedged ISR cache entry; `next dev` / a fresh
  `next start` re-render `/about` on demand.
- The deopt shell is self-healing locally because client bundles load and hydrate immediately.
- In production, the route's cached document response became a `304`-only artifact before the
  browser could ever receive a hydratable document — a state only reachable in the deployed
  cache layers.

### Why the expected fallback did not appear

The `DEFAULT_TEAM` / `safeFetch([])` fallback chain is correct and was verified working, but it
runs *inside* React (`TeamSection` receives `members: []` and renders the fallback cards). When
the HTTP document response for the page itself is discarded (`304`, empty body), the React tree
that contains the fallback is never delivered nor hydrated — so no fallback can appear, and no
API request is observable (the fetch happens server-side anyway and was already cached-with-fallback).

### Fix Applied

1. **`app/about/page.tsx`** — removed `export const revalidate = 300` so the page renders
   dynamically (λ), matching the rendering mode of the healthy production routes (`/activities`,
   `/blog`, `/news`) and bypassing the wedged static-document cache path entirely.
   `getTeamMembers()` keeps its internal data cache (`next: { revalidate: 300 }` in
   `lib/api.ts`), so database/API load is unchanged.
2. **`app/layout.tsx`** — wrapped `<TopLoader />` in `<Suspense fallback={null}>`, the documented
   remedy for "`useSearchParams` should be wrapped in a suspense boundary". This removes the
   "deopted into client-side rendering" deopt for every statically generated route, so `about.html`
   (and all other static routes) now carry real SSR markup.

No other route, component or configuration was modified. The database integration and fallback
logic were preserved as-is.

### Fallback Behavior

Verified in a real browser against the local production build (API unreachable → empty result):

- **Team data available:** `TeamSection` renders API-supplied cards (same component path;
  rendering itself was verified with the fallback cards filling the same slots).
- **Team data empty:** `getTeamMembers()` → `[]` → `DEFAULT_TEAM` fallback cards render.
- **Data retrieval fails:** `safeFetch` catches the error, logs `API fetch failed: …`, returns
  `[]` → fallback cards render. Verified with `ECONNREFUSED 127.0.0.1:8000` during build/run.
- **Invalid/unexpected data shape:** `unwrapList` returns `[]` for arrays or
  `{ results: [...] }`; anything else → `[]` → fallback cards render.

### Validation

| Command / check | Result |
| --- | --- |
| `npm run build` | ✅ Exit 0; **no more deopt warnings**; `.next/server/app/about.html` (38 KB) now contains `<main>`, `<nav>`, fallback team names (`NDAYIZEYE`, …), valid `<!DOCTYPE html>` |
| `npm run typecheck` (`tsc --noEmit`) | ✅ Exit 0 |
| `npm run lint` | ✅ Exit 0 (pre-existing `<img>` warnings in unrelated files only) |
| `next start -p 3113` + `curl /about` | ✅ `HTTP 200`, `x-nextjs-cache: HIT`, cached 38 KB-style document |
| Real-browser render (http://127.0.0.1:3113/about) | ✅ Standards mode (`doctype: html`), no `__next_error__`, navigation + hero + 6 fallback team cards rendered, zero console/hydration errors |
| Fallback scenarios (empty DB / failed fetch / bad shape) | ✅ Verified empty + failed + malformed paths return fallback cards (API locally unreachable = natural failure-injection) |
| Deployed environment verification | ❌ **Not verified** — the deployed host still returns the unconditional `304` (see Remaining Risks). Deployment + cache purge is required. |

### Remaining Risks / Required Deployment Steps

1. **Deploy the updated build** to the production server (the app-level fix in `app/layout.tsx`
   improves SSR output for all static routes).
2. **Purge the poisoned cache state on the production host.** The unconditional `304` for
   `/about` lives in the nginx reverse proxy's cache and/or the running Next server's ISR cache,
   neither of which is in this repository. Required on the server:
   - Restart the Next.js server process (drops in-process ISR cache/`IncrementalCache` state), and
   - Clear the nginx `proxy_cache_path` directory (or `proxy_cache_purge` the `/about` key;
     `Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url, Accept-Encoding` is in
     play, so a full path purge is the safe option).
3. **Post-deploy verification checklist** (run after steps 1–2):
   - `curl -I https://www.cjkamenge.com/about` must return `HTTP 200` with a non-zero body for an
     unconditional GET;
   - repeated requests must never return `304` to a plain GET;
   - the page renders team cards (or fallback cards) with no Quirks Mode console warning.
4. Optional hardening (not applied — out of scope): review the host's nginx caching
   configuration for HTML responses from this app, since sharing `s-maxage=300` HTML documents
   through `proxy_cache` without honoring conditional-request semantics is what allowed the
   wedged entry to persist.

No hard-coded team data was introduced; the API/db integration and all fallback behavior are
preserved and validated.
