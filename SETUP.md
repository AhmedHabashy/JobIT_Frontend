# JobIT Frontend — Local Setup

React + Vite + TypeScript SPA for the JobIT-26 Egyptian labour-market backend.

## 1. Prerequisites

- **Node.js 20 or newer** (the project targets Node 20/22; older versions may fail the Vite 5 build).
- **npm** (ships with Node). No global CLIs required.
- Access to a **Supabase project** (for auth) and the **JobIT backend URL** (for data).

Check your version:

```bash
node -v   # should print v20.x or newer
```

## 2. Clone & install

```bash
git clone <repo-url>
cd JobIT_Frontend
npm install
```

## 3. Configure environment (the part you edit to test locally)

The app reads three `VITE_*` variables at build/dev time. Copy the template and fill it in:

```bash
cp .env.example .env
```

Then edit **`.env`**:

| Variable                | What to put                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`     | Your Supabase project URL — Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY`| The Supabase **anon / public** key from the same page                        |
| `VITE_API_BASE_URL`     | The JobIT backend base URL, **no trailing slash**                            |

Example `.env`:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
VITE_API_BASE_URL=https://api.ahabashy.com
```

### Choosing `VITE_API_BASE_URL`

- **Against the deployed backend (simplest):** use `https://api.ahabashy.com`.
  In dev, Vite proxies your `/api/*` calls to this URL server-side, so you never
  hit browser CORS even though `localhost` isn't in the backend's allow-list.
- **Against a backend on your machine:** use `http://localhost:8000` (or whatever
  port your backend runs on).

> The Supabase values are **required** — the app throws on startup if either is
> missing. Auth (sign-in) happens directly against Supabase, so a valid project
> is needed even when you point the API at localhost.

## 4. Run it

```bash
npm run dev
```

Open **http://localhost:5173**.

- `/` — public landing page (works with no login).
- `/login` — sign in with a Supabase user that the backend has provisioned.
- `/app` — the authenticated workspace (chat, history, credits). Requires a valid login.

### How dev vs. prod differ (why local "just works")

- **Dev:** API calls go to same-origin `/api/*`; the Vite dev server proxies them
  to `VITE_API_BASE_URL` server-side (bypasses CORS). This proxy exists **only** in
  `npm run dev`.
- **Prod build:** calls go directly to the absolute `VITE_API_BASE_URL`. The build
  **fails on purpose** if that variable isn't an absolute `http(s)` URL — there is
  no proxy in production.

## 5. Getting a test login

To reach `/app` you need a Supabase user that exists in the backend's system.
Either:

- Ask the backend owner to provision an account for your email, **or**
- Create/confirm a user in the Supabase dashboard (Authentication → Users) that the
  backend recognizes.

Then sign in at `/login` with that email + password. (Access is operator-provisioned —
there is no open signup in the UI.)

## 6. Other useful commands

```bash
npm run typecheck   # tsc --noEmit — type errors only
npm run test        # vitest run — unit tests (headless)
npm run test:watch  # vitest in watch mode
npm run lint        # eslint, zero-warnings gate
npm run build       # tsc + vite build → dist/  (requires absolute VITE_API_BASE_URL)
npm run preview     # serve the built dist/ locally
```

## 7. Troubleshooting

| Symptom                                              | Fix                                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| App throws *"Missing Supabase env"* on load          | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` unset in `.env`. Restart dev after edit. |
| Build error *"VITE_API_BASE_URL must be … absolute"* | Set `VITE_API_BASE_URL` to a full `https://…` URL before `npm run build`.               |
| API calls 404 / return HTML in dev                   | Check `VITE_API_BASE_URL` points at a reachable backend; restart `npm run dev`.         |
| Changed `.env` but nothing updated                   | Vite reads env at startup — stop and re-run `npm run dev`.                              |
| Sign-in fails                                        | The user must exist in Supabase **and** be known to the backend.                        |

> **Note:** `.env` holds secrets (the anon key is public-safe, but keep the file
> out of commits — it's git-ignored). Never commit real credentials.
