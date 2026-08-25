# Implementation Plan: JobIT Web App — AI Career & Labour-Market Assistant

**Branch**: `001-jobit-web-app` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-jobit-web-app/spec.md`

## Summary

A single-page React application that lets operator-provisioned users sign in, hold streaming
chat conversations with the JobIT labour-market assistant (live-typing text, tool-progress
indicators, inline Plotly charts), manage multiple chat sessions, attach a CV to tailor
answers, understand their credit balance and every documented error state, and use the app in
LTR or RTL — plus a public marketing landing page.

Technical approach: a Vite + React + TypeScript SPA. Supabase handles auth; every backend
call carries a freshly-read `Authorization: Bearer` token. Server state (identity/credits,
session list, session detail) lives in TanStack Query; the streaming turn is a custom
`fetch`-based hook built on an isolated, unit-tested SSE parser. Charts render through one
component shared by live and stored charts. A typed `ApiError`→UX mapper drives a global
credits banner + toast system + inline field errors. Tailwind is configured to the Stitch
design tokens. Deploys to Cloudflare Pages.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), React 18, targeting ES2020 / modern evergreen browsers

**Primary Dependencies**: Vite 5, `@supabase/supabase-js` v2, `@tanstack/react-query` v5,
`react-router-dom` v6, `react-plotly.js` + `plotly.js-dist-min`, Tailwind CSS 3

**Storage**: None server-side owned by the frontend. Client-side: Supabase session in
`localStorage` (managed by supabase-js); UI direction preference in `localStorage`. All domain
data is owned by the backend and accessed over HTTP/SSE.

**Testing**: Vitest for unit tests. Mandatory units: the SSE parser (`parseSSE`) and the
`ApiError`→UX mapper. React Testing Library available for component tests where valuable.

**Target Platform**: Static SPA hosted on Cloudflare Pages (output `dist`, SPA redirect
`/* /index.html 200`). Backend at `VITE_API_BASE_URL` (prod `https://api.ahabashy.com`).

**Project Type**: Web frontend (single Vite SPA at repository root). No backend in this repo.

**Performance Goals**: Streamed reply text begins appearing within a few seconds of send
(SC-002); charts render inline without blocking the text stream; SPA interactive quickly on a
typical broadband connection.

**Constraints**: Never use `EventSource` (POST + Authorization required) — stream via `fetch`.
Never cache the raw access token — read the current Supabase session before every call. One
chart render path for live and stored charts. Full Arabic string translation is out of scope
for v1 (direction flip + RTL charts only).

**Scale/Scope**: ~7 user-facing screens/states (landing, login, workspace empty, session view,
plus banner/toast/RTL overlays). Per-user data volumes are small (tens of sessions, hundreds of
messages); no bulk/list virtualization required for v1.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against `.specify/memory/constitution.md` v1.0.0:

| Principle | How this plan complies |
|-----------|------------------------|
| I. API Contract Fidelity (NON-NEGOTIABLE) | Auth via `signInWithPassword`; a single `apiClient` awaits `supabase.auth.getSession()` and injects a fresh Bearer token on every call (no caching); JIT provisioning assumed (no signup call). `API.md`/`/openapi.json` drive the typed contract in `src/types` + `contracts/`. |
| II. Resilient Streaming | Isolated `parseSSE` module + `useChatStream` hook using `fetch`/`TextDecoder`; handles pre-stream HTTP 403/429 and in-stream `error` frames; always terminates on `done`; single chart path for live + stored. |
| III. Clean Typed State Model | TS strict; TanStack Query owns server cache (`['me']`,`['chats']`,`['chat',id]`); local UI state (compose buffer, streaming buffer, attachment) kept separate; explicit API types; Stitch used for style only, not markup. |
| IV. Error-Model UX Fidelity | One `ApiError`→UX mapper: `resources_exhausted`→persistent banner + block send; `rate_limited`→transient toast; `forbidden`→sign-out/login; `validation_failed`/`cv_parsing_failed`→inline; `storage_unavailable`/`internal_error`→retryable toast; `request_id` surfaced everywhere. Credits from `/me`; any `resources_exhausted` = out-of-credits. |
| V. Incremental Verifiable Delivery | Task ordering follows: auth → session CRUD → streaming hook → charts → upload → error states; each layer runnable before the next. |

**Result**: PASS. No deviations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/001-jobit-web-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (backend endpoint + SSE contracts)
│   ├── rest-endpoints.md
│   └── sse-stream.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

Single Vite SPA at the repo root. The existing `dist/` is build output (overwritten by
`npm run build`); `node_modules/` is present but there is no `package.json` yet — created fresh.

```text
index.html                     # Vite entry
package.json                   # created fresh
vite.config.ts
tailwind.config.ts             # Stitch design tokens
tsconfig.json                  # strict
.env.example                   # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_API_BASE_URL
public/
└── _redirects                 # /* /index.html 200

src/
├── main.tsx                   # bootstraps providers + router
├── App.tsx                    # route tree
├── lib/
│   ├── supabase.ts            # single browser client (persistSession, autoRefreshToken)
│   ├── apiClient.ts           # fetch wrapper: fresh Bearer, X-Request-ID, typed errors
│   ├── sse.ts                 # parseSSE — isolated, dependency-free, unit-tested
│   ├── apiError.ts            # ApiError type + fromResponse + toUx mapper
│   └── queryKeys.ts           # ['me'], ['chats'], ['chat', id]
├── auth/
│   ├── AuthProvider.tsx       # session state + onAuthStateChange
│   ├── useAuth.ts
│   └── guards.tsx             # RequireAuth / RedirectIfAuthed
├── api/
│   ├── me.ts                  # getMe + useMe
│   ├── sessions.ts            # list/new/detail/delete fns + hooks (optimistic)
│   └── upload.ts              # uploadCv + useUploadCv
├── features/
│   ├── chat/
│   │   ├── useChatStream.ts   # deferred-create + stream state machine
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ToolStatus.tsx     # "using {tool}…"
│   │   ├── PlotlyChart.tsx    # one path: {plotly_json, rtl}
│   │   └── Composer.tsx       # textarea + attach + send (blocked while streaming)
│   └── sessions/
│       ├── Sidebar.tsx        # New Chat + session list + identity/credits
│       └── SessionListItem.tsx
├── components/
│   ├── Banner.tsx             # out-of-credits (persistent)
│   ├── Toast.tsx / ToastProvider.tsx
│   ├── AppShell.tsx           # sidebar + main layout
│   └── ui/                    # buttons, icons (Material Symbols), inputs
├── pages/
│   ├── Landing.tsx
│   ├── Login.tsx
│   └── Workspace.tsx          # /app and /app/c/:sessionId
├── i18n/
│   └── DirectionProvider.tsx  # ltr/rtl context + <html dir> + localStorage
├── types/
│   └── api.ts                 # UserOut, ChatSessionSummary, ChatSessionDetail, Message, Chart, ...
└── styles/
    └── index.css              # Tailwind directives + Geist/Material Symbols

tests/  (or co-located *.test.ts)
├── sse.test.ts                # parseSSE (frames, partial buffers, multi-line data)
└── apiError.test.ts           # code → UX mapping
```

**Structure Decision**: Single-project web frontend. Layers map 1:1 to the constitution's
delivery order and to the modules named in the architecture decisions: `lib/` holds the
cross-cutting primitives (supabase client, api client, SSE parser, error mapper, query keys);
`api/` wraps endpoints in typed functions + Query hooks; `features/chat` and `features/sessions`
hold the two interactive surfaces; `components/` holds shared UI (banner, toasts, shell);
`pages/` holds the three routed screens. Server-cache state (Query) is deliberately separate
from local UI state (compose/stream buffers, attachment).

## Complexity Tracking

> No constitution violations. Section intentionally empty.
