# JobIT Frontend

A React + Vite + TypeScript single-page app for the **JobIT-26** Egyptian labour-market
analytics backend. Authorized users sign in, chat with an AI career assistant that streams
answers and renders analytical charts inline, attach a CV for tailored guidance, manage
multiple conversations, and use the app in English or Arabic (RTL).

## Stack

- **React 18 + Vite + TypeScript** (strict)
- **@supabase/supabase-js** — auth (email/password, JIT-provisioned accounts)
- **@tanstack/react-query** — server state (identity/credits, session list & detail)
- **react-plotly.js + plotly.js-dist-min** — charts (lazy-loaded)
- **react-router-dom** — routing
- **Tailwind CSS** — styled to the Stitch design tokens (Geist font, Material Symbols)

The backend contract is the source of truth: [`api_docs/API.md`](./api_docs/API.md) and the
live `/openapi.json`. Design docs live under [`specs/001-jobit-web-app/`](./specs/001-jobit-web-app/).

## Prerequisites

- Node.js 20+ and npm
- A Supabase project URL + anon key
- An operator-provisioned account (there is **no self-serve signup**)
- The backend reachable at your `VITE_API_BASE_URL`

## Local development

```bash
npm install
cp .env.example .env      # fill in the three values below
npm run dev               # http://localhost:5173
```

`.env`:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co   # project API URL, NOT the Postgres string
VITE_SUPABASE_ANON_KEY=<anon public key>
VITE_API_BASE_URL=https://api.ahabashy.com            # backend base URL (no trailing slash)
```

> **Local CORS / dev proxy.** `localhost` is typically not in the backend's
> `AUTH__ALLOWED_ORIGINS`, so the browser can't call the backend cross-origin during dev.
> `vite.config.ts` proxies `/api/*` to `VITE_API_BASE_URL` server-side, and the app calls
> same-origin `/api/...` in dev (`src/lib/apiClient.ts`, gated on `import.meta.env.DEV`).
> No backend change is needed locally. In production the app calls `VITE_API_BASE_URL`
> directly, so the deployed origin **must** be added to the backend's `AUTH__ALLOWED_ORIGINS`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server (with the `/api` proxy) |
| `npm run build` | Typecheck (`tsc --noEmit`) + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run test` | Vitest unit tests (SSE parser + error mapper) |
| `npm run typecheck` | Type-only check |

## Architecture (brief)

- **Auth** — a single Supabase browser client; every backend call reads the current session
  and sends a fresh `Authorization: Bearer` token (never cached). `AuthProvider` + route
  guards (`RequireAuth` / `RedirectIfAuthed`).
- **API client** (`src/lib/apiClient.ts`) — one fetch wrapper: fresh token, `X-Request-ID`,
  typed `ApiError` on non-2xx, decoupled `forbidden`/`resources_exhausted` handlers, and a
  separate `streamRequest()` for SSE.
- **Streaming** — `src/lib/sse.ts` is an isolated, unit-tested SSE parser; `useChatStream`
  drives the turn (deferred session creation, `text`/`status`/`chart`/`error`/`done`
  dispatch, blocks concurrent sends). One `PlotlyChart` path serves live and stored charts.
- **Errors** — `src/lib/apiError.ts` maps every `ApiError` code to a distinct UX
  (out-of-credits banner, transient/retryable toasts, redirect-to-login, inline). Every
  error surfaces its `request_id`.
- **i18n** — `DirectionProvider` toggles LTR/RTL (persisted); charts honor per-chart `rtl`.

Routes: `/` (public landing → redirects to `/app` if signed in) · `/login` · `/app` ·
`/app/c/:sessionId`.

## Testing

```bash
npm run test
```

Unit tests cover the two highest-risk isolated modules: the SSE frame parser (`tests/sse.test.ts`)
and the `ApiError`→UX mapper (`tests/apiError.test.ts`).

## Deploy — Cloudflare Pages

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variables:** set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_API_BASE_URL` in the Pages project settings.
- **SPA routing:** [`public/_redirects`](./public/_redirects) contains `/* /index.html 200`
  so client-side routes resolve on refresh (Vite copies it into `dist/`).
- **CORS:** add the Pages origin (e.g. `https://your-app.pages.dev` and any custom domain) to
  the backend's `AUTH__ALLOWED_ORIGINS`.

```bash
npm run build   # outputs dist/
# then deploy dist/ to Cloudflare Pages (dashboard or `wrangler pages deploy dist`)
```
