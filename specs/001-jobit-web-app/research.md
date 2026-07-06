# Phase 0 Research: JobIT Web App

All Technical Context items are resolved (no NEEDS CLARIFICATION remained). This document
records the key technical decisions, their rationale, and rejected alternatives.

## 1. Consuming POST Server-Sent Events in the browser

- **Decision**: Use `fetch()` with an `Authorization` header, read `response.body`
  (`ReadableStream`), decode chunks with `TextDecoder`, buffer text, split completed frames on
  `"\n\n"`, and parse each frame's `event:`/`data:` lines. Encapsulate this in a pure
  `parseSSE(stream): AsyncGenerator<{event, data}>` module with no React/DOM coupling.
- **Rationale**: The endpoint requires POST + a Bearer header; `EventSource` supports neither.
  `fetch` streaming is the standard workaround. A pure parser is unit-testable against
  hand-built chunk sequences (partial frames, split across chunk boundaries, multi-line
  `data:`), which is the highest-risk area per the constitution.
- **Alternatives considered**:
  - `EventSource` — rejected: no POST, no custom headers.
  - `@microsoft/fetch-event-source` — rejected: adds a dependency for logic we can own in
    ~40 lines and must unit-test anyway; keeps the parser dependency-free per the constitution.

## 2. Fresh token on every request

- **Decision**: The `apiClient` awaits `supabase.auth.getSession()` immediately before each
  request and reads `session.access_token` at call time. The token is never stored in a
  module variable or React state.
- **Rationale**: Tokens expire ~1h; supabase-js auto-refreshes in the background, so the
  *current* session always holds a valid token. Caching would risk sending an expired token.
- **Alternatives considered**: Caching the token and refreshing on 401/403 — rejected as more
  code and more failure modes than simply reading the current session each time.

## 3. Streaming turn is not a React Query mutation

- **Decision**: Implement the send/stream flow as a custom `useChatStream` hook holding local
  state (streaming text buffer, tool status, in-progress charts, error, `isStreaming`). On
  `done`, invalidate `['chat', id]` and `['chats']`, and refetch `['me']`.
- **Rationale**: React Query models request→single-response; SSE is a long incremental
  response with intermediate UI state. Forcing it into a mutation fights the cache. Keeping it
  separate honors "server-cache state separate from local UI state" (Principle III).
- **Alternatives considered**: `useMutation` with manual cache writes — rejected: awkward for
  incremental frames and tool/chart interim state.

## 4. Deferred session creation

- **Decision**: "New Chat" sets a local "drafting" state and focuses the composer without
  calling the backend. On first send with no session id, `POST /chat/new` → get `session_id`,
  then open the stream to `/chat/{session_id}/message`, then insert the new session into the
  `['chats']` cache and navigate to `/app/c/{session_id}`.
- **Rationale**: Matches the clarification (no empty untitled sessions). `route`/`title` are
  only populated by the backend after the first message anyway, so nothing is lost.
- **Alternatives considered**: Create-on-click — rejected per clarification (orphaned empty
  sessions).

## 5. Blocking sends while streaming

- **Decision**: `useChatStream` exposes `isStreaming`; the Composer disables send while true
  and re-enables on `done` (including the error-then-done path).
- **Rationale**: Simplest correct state machine; avoids interleaved streams and out-of-order
  credit debits (clarification). Also aligns with the per-user chat rate bucket.

## 6. Chart rendering (one path, RTL-aware)

- **Decision**: A `PlotlyChart` component receives `{ plotly_json: string, rtl: boolean }`,
  `JSON.parse`s `plotly_json` into `{data, layout}`, and when `rtl` sets
  `layout.font.family` unchanged but applies RTL hints: `layout.direction`/legend and axis
  side adjustments and, where the figure uses categorical x, respect the server-provided
  ordering. Uses `react-plotly.js` bound to `plotly.js-dist-min`. Live `chart` frames and
  stored `charts[]` both pass through this component.
- **Rationale**: `charts[]` from history and live `chart` frames share the exact `{plotly_json,
  rtl}` shape (API.md §6/§8), so one component guarantees identical rendering (Principle II).
- **Alternatives considered**: Full Plotly bundle — rejected for bundle size;
  `plotly.js-dist-min` is sufficient. Re-implementing charts natively — rejected: server sends
  Plotly figures directly.

## 7. Error model → UX mapping

- **Decision**: `apiError.ts` defines the `ApiError` type and a `toUx(error)` function
  returning a discriminated UX directive: `banner` (resources_exhausted), `toast-transient`
  (rate_limited), `toast-retryable` (storage_unavailable, internal_error), `redirect-login`
  (forbidden), `inline` (validation_failed, cv_parsing_failed), plus `not_found`. Every branch
  carries `request_id`. A `ToastProvider` and a `CreditsBanner` context consume these; inline
  errors are returned to the calling component (upload/composer).
- **Rationale**: One authoritative mapping is a review gate (constitution) and prevents codes
  collapsing into a generic error. Unit-tested exhaustively (all codes).

## 8. Credits display

- **Decision**: `useMe()` (`['me']`) renders `credits` in the sidebar; refetch after each
  completed turn and on window focus. Any `resources_exhausted` from any call flips a global
  out-of-credits banner and blocks sending. `/me` is never expected to return 0.
- **Rationale**: Matches API.md's note that `/me` never reports 0; the exhausted state is only
  observable as `resources_exhausted` (clarification chose refetch-only, no local decrement).

## 9. Auth session & provisioning

- **Decision**: One Supabase browser client with `persistSession: true`,
  `autoRefreshToken: true`. `AuthProvider` seeds from `getSession()` and subscribes to
  `onAuthStateChange`. No signup path (JIT provisioning happens on the first authed backend
  call). Distinguish login errors: Supabase auth error → "invalid credentials"; a `403
  forbidden` from a backend call after a valid login → "account deactivated".
- **Rationale**: Principle I; the backend provisions on first authed request, so a successful
  Supabase login followed by a `403` specifically indicates operator deactivation, not bad
  credentials.

## 10. Routing & guards

- **Decision**: `react-router-dom` v6. `/` = Landing (redirect to `/app` if authed); `/login`
  = Login (redirect to `/app` if authed); `/app` = workspace shell (RequireAuth) with an empty
  new-chat state; `/app/c/:sessionId` = a session; unknown → redirect to `/`.
- **Rationale**: Matches the routing clarification (authed users skip the landing at `/`).

## 11. Styling — Tailwind vs. the Stitch CDN config

- **Decision**: Port the Stitch `tailwind.config` (colors, borderRadius, spacing, fontSize,
  Geist font family, Material Symbols) into a local `tailwind.config.ts`; load Geist and
  Material Symbols via `<link>`; build CSS through Vite (no runtime CDN Tailwind).
- **Rationale**: Reproduces the reference visual system exactly while shipping a proper build
  (the Stitch files use the dev-only CDN build). Implements our own markup (Principle III).

## 12. Testing scope for v1

- **Decision**: Vitest. Mandatory unit tests: `parseSSE` (frame splitting incl. chunk
  boundaries and multi-line data) and `toUx` (every ApiError code). Component/integration tests
  optional where they add confidence (guards, composer send-blocking).
- **Rationale**: Constitution names these two as the highest-risk isolated modules.
