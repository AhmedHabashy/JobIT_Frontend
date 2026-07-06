<!--
Sync Impact Report
==================
Version change: (template, unversioned) → 1.0.0
Bump rationale: Initial ratification of the project constitution (MAJOR baseline).

Principles defined:
  I.   API Contract Fidelity (NON-NEGOTIABLE)
  II.  Resilient Streaming
  III. Clean Typed State Model
  IV.  Error-Model UX Fidelity
  V.   Incremental Verifiable Delivery

Added sections:
  - Technology & Design Constraints
  - Development Workflow
  - Governance

Removed sections: none (initial adoption)

Templates reviewed for alignment:
  ✅ .specify/templates/plan-template.md  — generic "Constitution Check" gate; no principle-specific edits required
  ✅ .specify/templates/spec-template.md  — scope/requirements structure compatible; no edits required
  ✅ .specify/templates/tasks-template.md — task categorization compatible; no edits required

Follow-up TODOs: none
-->

# JobIT Frontend Constitution

The JobIT Frontend is a React + Vite + TypeScript single-page application for the JobIT-26
Egyptian labour-market analytics backend. This constitution defines the non-negotiable
engineering principles that govern how the frontend is designed, built, and reviewed.

## Core Principles

### I. API Contract Fidelity (NON-NEGOTIABLE)

`API.md` and the live `/openapi.json` are the source of truth for all backend interaction;
when the two disagree, `/openapi.json` wins. The frontend MUST NOT hand-roll behavior the
contract already defines.

- Authentication MUST use `@supabase/supabase-js` `signInWithPassword`. The raw Supabase
  token endpoint MUST NOT be called directly.
- Before every backend call the client MUST read the current session via
  `supabase.auth.getSession()` and send a fresh `Authorization: Bearer <access_token>`.
  The raw access token MUST NOT be cached — tokens expire ~1h and the Supabase client
  auto-refreshes, so the current session is always re-read.
- The backend provisions users just-in-time on first authed request; there is NO signup
  call and the frontend MUST NOT invent one.

**Rationale:** Auth and contract drift are the most expensive class of bug here. Reading
the session fresh every call is the only way to stay correct across token expiry.

### II. Resilient Streaming

The chat message endpoint (`POST /api/v1/chat/{id}/message`) returns Server-Sent Events and
MUST be consumed with `fetch()` — never `EventSource` (which cannot send POST + Authorization).

- The reader MUST take `response.body`, decode with `TextDecoder`, buffer, split frames on
  `"\n\n"`, and parse each frame's `event:` and `data:` lines.
- All event types MUST be handled exactly: `text` (append for live typing), `status` (tool
  progress indicator), `chart` (render Plotly, respecting the `rtl` flag), `error` (surface
  it, keep going), `done` (finalize, store `message_id`).
- Two distinct failure paths MUST both be handled: pre-stream auth/rate-limit failures
  (403/429) arrive as a normal HTTP error BEFORE streaming begins; mid-stream problems
  arrive as an in-stream `error` event. The stream ALWAYS terminates with `done`.
- A SINGLE chart render path MUST serve both live `chart` frames and stored `charts[]`
  re-read from history — they share the `{ plotly_json, rtl }` shape.

**Rationale:** Streaming is the core UX and the easiest thing to get subtly wrong; one
parser and one chart path prevent divergence between live and replayed conversations.

### III. Clean Typed State Model

TypeScript strict mode is mandatory. The frontend implements its own clean React state
model — the Stitch reference markup defines layout and visual style ONLY and MUST NOT be
copied verbatim.

- Server state (session list and detail) MUST be managed with `@tanstack/react-query`.
- API request and response shapes MUST be modeled as explicit TypeScript types derived
  from the contract.
- Local UI state (compose buffer, streaming buffer, attachments) MUST be kept separate
  from server cache state.

**Rationale:** A clean, typed boundary between server cache and UI state is what keeps
streaming, optimistic session CRUD, and history replay from fighting each other.

### IV. Error-Model UX Fidelity

Every `ApiError` `code` MUST map to a distinct, intentional UX outcome:

- `resources_exhausted` → persistent "out of credits" banner AND sending is blocked (the
  account auto-deactivates at zero credits).
- `rate_limited` → transient "slow down" toast.
- `forbidden` → route to login / show a deactivated-account notice.
- `validation_failed` → inline field error (e.g. bad file type or size).
- `cv_parsing_failed` → inline upload error.
- `storage_unavailable` / `internal_error` → retryable toast.

Credits MUST be rendered from a successful `GET /api/v1/me` (which never returns 0), and
ANY `resources_exhausted` response MUST be treated as the out-of-credits signal. The
`request_id` from error bodies MUST always be surfaced somewhere accessible for debugging.

**Rationale:** These codes carry operational meaning (billing, deactivation, rate limits);
collapsing them into one generic error hides state the user and operators need.

### V. Incremental Verifiable Delivery

The application MUST be built and verified in dependency order, each layer independently
runnable before the next begins:

1. Auth (login + session-bound API client)
2. Session CRUD (list, create, delete — optimistic UI allowed)
3. Streaming hook, with the SSE parser as an isolated, independently testable module
4. Chart rendering (live and stored, one path)
5. CV upload and `attached_cv_id` threading
6. Error states across all of the above

**Rationale:** Each layer depends on the one below it; verifying bottom-up keeps failures
localized and makes the streaming/chart complexity tractable.

## Technology & Design Constraints

- **Stack:** React + Vite + TypeScript, `@supabase/supabase-js`, `@tanstack/react-query`,
  `react-plotly.js` + `plotly.js-dist-min`, `react-router-dom`.
- **Environment:** configuration is read from `import.meta.env` — `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`. A `.env.example` MUST be maintained.
- **Design system (from the Stitch references):** Geist font; primary `#005c86`; mint
  secondary `#62fae3`; off-white surface `#f9f9f7`; Material Symbols icons; rounded cards.
- **i18n / RTL:** the app serves Arabic and English users. Layout direction MUST support
  RTL, and any chart with `rtl: true` MUST render RTL. Full UI-string translation is out
  of scope for v1 but the structure MUST NOT preclude adding it later.
- **Deployment:** Cloudflare Pages — build `npm run build`, output `dist`, with
  `public/_redirects` containing `/* /index.html 200`. A README MUST document local dev
  and deploy steps.

## Development Workflow

- Work proceeds layer by layer per Principle V; a layer is not "done" until it runs.
- Code review MUST verify compliance with these principles; the streaming parser and the
  error-code mapping are explicit review gates.
- Any deviation from a principle MUST be justified in the plan's Complexity Tracking
  section before it is implemented.

## Governance

This constitution supersedes ad-hoc practice for the JobIT Frontend. Amendments MUST be
recorded by editing this file, bumping the version per the policy below, and updating the
Sync Impact Report at the top.

- **Versioning policy (semantic):** MAJOR for backward-incompatible principle removals or
  redefinitions; MINOR for a new principle/section or materially expanded guidance; PATCH
  for clarifications and non-semantic refinements.
- **Compliance review:** every plan runs the Constitution Check gate; every PR/review
  confirms the changed code honors the principles above.
- **Runtime guidance:** the Spec Kit `plan.md` and `tasks.md` for each feature are the
  operational expression of this constitution and must remain consistent with it.

**Version**: 1.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06
