# Contract: REST Endpoints (frontend consumption)

Source of truth: `api_docs/API.md` and the live `/openapi.json` (if they disagree, trust
`/openapi.json`). Base URL: `import.meta.env.VITE_API_BASE_URL`. All `/api/v1/*` calls require
`Authorization: Bearer <fresh supabase access_token>` and send `X-Request-ID: <uuid>`.

The client wrapper (`apiClient`) contract:
- Reads the current session via `supabase.auth.getSession()` per call; injects a fresh Bearer.
- Generates a per-request `X-Request-ID` (uuid).
- On 2xx: parses JSON (except upload which is 2xx JSON too; streaming uses a separate path).
- On non-2xx: parses the `ApiError` body and throws a typed `ApiError` (with `httpStatus`).
- Side effects: `forbidden` → sign out + route `/login`; `resources_exhausted` → set global
  out-of-credits state.

| # | Method | Path | Auth | Request | Success | Frontend use |
|---|--------|------|------|---------|---------|--------------|
| 1 | GET | `/healthz` | none | — | `200 {status:"ok"}` | optional connectivity check |
| 2 | GET | `/api/v1/me` | yes | — | `200 UserOut` | identity + credits on load; refetch after each turn & on focus |
| 3 | POST | `/api/v1/upload` | yes | multipart `file` (.pdf/.docx/.doc ≤10 MiB) | `200 UploadResponse` | CV attach → keep `file_id` |
| 4 | POST | `/api/v1/chat/new` | yes | — | `200 {session_id}` | deferred create on first send |
| 5 | GET | `/api/v1/chats` | yes | — | `200 ChatSessionSummary[]` | sidebar list (`[]` when none) |
| 6 | GET | `/api/v1/chat/{id}` | yes | — | `200 ChatSessionDetail` | open session (messages + charts + user_profile) |
| 7 | DELETE | `/api/v1/chat/{id}` | yes | — | `200 {status:"deleted"}` | delete (optimistic sidebar) |
| 8 | POST | `/api/v1/chat/{id}/message` | yes | `application/json MessageRequest` | `200 text/event-stream` | streaming turn — see `sse-stream.md` |

## Error responses (any endpoint)

`ApiError` body `{ code, message, request_id, details }` with these HTTP↔code pairings:

| HTTP | code | Frontend UX |
|------|------|-------------|
| 400 | `validation_failed` | inline error at call site (e.g. bad upload) |
| 403 | `forbidden` | sign out → `/login`; if just logged in, show "account deactivated" |
| 404 | `not_found` | "session not found" state (e.g. deleted elsewhere) |
| 422 | `cv_parsing_failed` | inline error on the composer/upload |
| 429 | `rate_limited` | transient "slow down" toast; allow retry |
| 429 | `resources_exhausted` | persistent out-of-credits banner + block sending |
| 503 | `storage_unavailable` | retryable toast (upload write failed — no DB row) |
| 500 | `internal_error` | retryable toast |

Every surfaced error must expose `request_id` (banner/toast text + console).

## Rate limits (inform UX, not enforced client-side)

- upload: 10/min (burst 3) · chat message: 30/min (burst 10) · state_change
  (`chat/new`,`delete`): 60/min (burst 20). Exceeding → `429 rate_limited`.

## Request/response shapes

See `../data-model.md` for `UserOut`, `ChatSessionSummary`, `ChatSessionDetail`, `Message`,
`Chart`, `UserProfile`, `UploadResponse`, `SessionResponse`, `MessageRequest`, `ApiError`.
