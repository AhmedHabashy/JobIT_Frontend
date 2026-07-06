# Contract: SSE Streaming Turn

Endpoint: `POST /api/v1/chat/{session_id}/message` → `200 text/event-stream`.
Consumed with `fetch` (NOT `EventSource`). Requires the same fresh Bearer + `X-Request-ID`.

## Request
```jsonc
// application/json — MessageRequest
{ "content": "string 1..8000 chars", "attached_cv_id": "uuid | null" }
```

## Two failure paths (both MUST be handled)

1. **Pre-stream HTTP error** — auth/rate/credit failures arrive as a normal HTTP error BEFORE
   the body streams (e.g. `403 forbidden`, `429 rate_limited`, `429 resources_exhausted`).
   Detect via `!response.ok` before reading the stream; route through the `ApiError`→UX mapper.
   No partial assistant message is created.
2. **In-stream error** — once streaming has begun, problems arrive as an `error` frame. Show it
   (non-fatal), keep reading; the stream still ends with `done`.

## Frame format

```
event: <type>\n
data: <json>\n
\n                      <-- frame terminator (blank line => "\n\n")
```

Parser (`parseSSE`) contract:
- Input: `ReadableStream<Uint8Array>` (`response.body`).
- Decode with `TextDecoder("utf-8")`, `{ stream: true }`.
- Maintain a text buffer; split off complete frames on `"\n\n"`; keep the remainder buffered
  (a frame may span multiple chunks).
- For each frame, read the `event:` line and (possibly multi-line) `data:` line(s); `JSON.parse`
  the data. Yield `{ event, data }`.
- Ignore empty keep-alive lines / comments (`:`-prefixed) gracefully.

## Event types (handle exactly)

| event | data | Handler behavior |
|-------|------|------------------|
| `text` | `{ content: string }` | append `content` to the assistant text buffer (live-typing) |
| `status` | `{ tool: string }` | show transient "using {tool}…" indicator |
| `chart` | `{ plotly_json: string, rtl: boolean }` | parse + render via `PlotlyChart`; push to in-flight charts |
| `error` | `{ code, message, request_id, details }` | record as `streamError`, show inline, keep reading |
| `done` | `{ message_id: string }` | finalize: persist the assistant message; store `message_id` as render key; stop |

## Guarantees the client relies on

- The stream ALWAYS terminates with a `done` frame (even after an `error`).
- `message_id` is an opaque completion marker (safe as a React key); it is NOT refetchable —
  re-read persisted messages via `GET /chat/{session_id}`.
- Stored `charts[]` on a history message (endpoint #6) use the identical `{plotly_json, rtl}`
  shape, so the same `PlotlyChart` renders both live and replayed charts.

## Post-`done` side effects

- Invalidate `['chat', session_id]` and `['chats']` (title/updated_at may have changed).
- Refetch `['me']` to refresh the credit balance (one credit consumed).
- Re-enable the Composer (`isStreaming = false`).
- For a deferred-created session: the `session_id` used was obtained from `POST /chat/new`
  immediately before streaming; after `done`, ensure the session is present in `['chats']` and
  the route is `/app/c/{session_id}`.
