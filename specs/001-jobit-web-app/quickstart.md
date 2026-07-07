# Quickstart: JobIT Web App (local dev)

## Prerequisites
- Node.js 20+ and npm.
- Backend reachable at your `VITE_API_BASE_URL` (prod: `https://api.ahabashy.com`,
  local: `http://localhost:8000`).
- Supabase project URL + anon key (the app authenticates users via Supabase).
- An operator-provisioned test account (e.g. `test@jobit.dev`) — there is no self-serve signup.

## Setup
```bash
npm install
cp .env.example .env        # then fill in the three values below
npm run dev                 # Vite dev server (default http://localhost:5173)
```

`.env` values (all read from `import.meta.env`):
```
VITE_SUPABASE_URL=https://<project>.supabase.co     # the project API URL, NOT the Postgres connection string
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_API_BASE_URL=https://api.ahabashy.com
```

> **Dev CORS / proxy.** `localhost` is not in the backend's `AUTH__ALLOWED_ORIGINS`, so
> the browser cannot call the backend cross-origin during local dev. `vite.config.ts`
> therefore proxies `/api/*` to `VITE_API_BASE_URL` server-side, and in dev the app calls
> same-origin `/api/...` (see `src/lib/apiClient.ts`, gated on `import.meta.env.DEV`). No
> backend change is needed for local dev. **For deployment**, the Pages origin must be added
> to the backend's `AUTH__ALLOWED_ORIGINS` (production calls `VITE_API_BASE_URL` directly).

## Verify each layer (matches the constitution's delivery order)

1. **Auth**: open `/login`, sign in with the test account → redirected to `/app`; sidebar shows
   your email and remaining credits (from `GET /me`). Bad password → "invalid credentials".
2. **Sessions**: sidebar lists existing sessions (`GET /chats`); "New Chat" opens a blank
   composer without creating a session; deleting a session removes it immediately.
3. **Streaming**: send a message → assistant text streams in; a "using {tool}…" indicator may
   appear; the turn ends cleanly. (First send in a new chat creates the session, then streams.)
4. **Charts**: ask something analytical → an inline Plotly chart renders. Reopen the session →
   the stored chart renders identically.
5. **Upload**: attach a `.pdf`/`.docx`/`.doc` (≤10 MiB) → filename shows; send → answer is
   CV-aware. Attach a `.txt` or >10 MiB file → inline rejection, nothing sent.
6. **Error states**: exhaust credits → persistent out-of-credits banner + send blocked; send
   too fast → transient rate-limit toast; expired/deactivated → back to `/login`. Every error
   shows a `request_id`.
7. **RTL**: toggle direction in the header → layout mirrors; an Arabic-marked chart renders RTL.

## Tests
```bash
npm run test         # Vitest — parseSSE and ApiError→UX mapper at minimum
```

## Build & deploy (Cloudflare Pages)
```bash
npm run build        # outputs to dist/
```
- Framework preset: none/Vite. Build command `npm run build`. Output directory `dist`.
- `public/_redirects` contains `/* /index.html 200` so client-side routes resolve on refresh.
- Set the three `VITE_*` environment variables in the Pages project settings.
- Ensure the backend's `AUTH__ALLOWED_ORIGINS` includes your Pages origin (CORS).
