# Phase 1 Data Model: JobIT Web App

These are the client-side TypeScript shapes mirroring the backend contract (API.md /
`/openapi.json`) plus the local UI state models. Backend shapes are read-only projections; the
frontend owns no persistent domain storage.

## Backend-mirrored types (`src/types/api.ts`)

### UserOut (`GET /api/v1/me`)
```ts
interface UserOut {
  id: string;            // Supabase user UUID (== local user id)
  email: string;
  role: "user" | "admin";
  credits: number;       // always >= 1 in a 200 response (never 0)
}
```

### ChatSessionSummary (`GET /api/v1/chats` item)
```ts
interface ChatSessionSummary {
  session_id: string;    // UUID
  created_at: string;    // ISO-8601 UTC
  updated_at: string;    // ISO-8601 UTC
  route: string;         // "" until first message classified
  title: string;         // "" until title generated -> show placeholder
  summary: string;       // "" until conversation exceeds window_size
  window_size: number;
}
```

### ChatSessionDetail (`GET /api/v1/chat/{id}`)
```ts
interface ChatSessionDetail extends ChatSessionSummary {
  user_profile: UserProfile | null;   // null until a CV is parsed in this session
  messages: Message[];
}
```

### Message
```ts
interface Message {
  role: "user" | "assistant";
  content: string;
  charts: Chart[] | null;   // null when no charts; same shape as live `chart` frames
}
```

### Chart
```ts
interface Chart {
  plotly_json: string;   // serialized Plotly figure ({data, layout}) — JSON.parse before render
  rtl: boolean;          // true => render RTL regardless of app direction
}
```

### UserProfile (assistant-derived from CV)
```ts
interface UserProfile {
  skills: string[];
  job_titles: string[];
  experience: string;         // e.g. "3 years"
  core_tasks: string[];
  education_level: string;    // e.g. "bachelor"
}
```

### UploadResponse (`POST /api/v1/upload`)
```ts
interface UploadResponse {
  file_id: string;   // pass as attached_cv_id on the next message
  filename: string;
}
```

### SessionResponse (`POST /api/v1/chat/new`)
```ts
interface SessionResponse { session_id: string; }
```

### ApiError (all non-2xx bodies)
```ts
type ApiErrorCode =
  | "validation_failed"      // 400
  | "forbidden"              // 403
  | "not_found"              // 404
  | "cv_parsing_failed"      // 422
  | "rate_limited"           // 429
  | "resources_exhausted"    // 429
  | "storage_unavailable"    // 503
  | "internal_error";        // 500

interface ApiError {
  code: ApiErrorCode;
  message: string;
  request_id: string;
  details: unknown | null;
  httpStatus: number;        // captured by apiClient for disambiguating the two 429s if needed
}
```

## SSE frame types (live turn)

```ts
type SseEvent =
  | { event: "text";   data: { content: string } }
  | { event: "status"; data: { tool: string } }
  | { event: "chart";  data: Chart }                       // { plotly_json, rtl }
  | { event: "error";  data: Omit<ApiError, "httpStatus"> }
  | { event: "done";   data: { message_id: string } };     // always the final frame
```

## Local UI state models (not server cache)

### MessageRequest (outgoing)
```ts
interface MessageRequest {
  content: string;              // 1..8000 chars
  attached_cv_id: string | null;
}
```

### ComposerState (Composer.tsx local state)
```ts
interface ComposerState {
  text: string;
  attachment: { file_id: string; filename: string } | null;
  inlineError: string | null;   // validation_failed / cv_parsing_failed shown here
}
```

### StreamState (useChatStream local state)
```ts
interface StreamState {
  isStreaming: boolean;         // true => Composer send disabled
  assistantText: string;        // accumulates `text` frames
  toolStatus: string | null;    // current "using {tool}…" (from `status`)
  charts: Chart[];              // accumulates `chart` frames for the in-flight message
  streamError: ApiError | null; // in-stream `error` frame (shown, non-fatal)
  lastMessageId: string | null; // from `done`
}
```

### Direction (i18n)
```ts
type Direction = "ltr" | "rtl";  // app-level; persisted to localStorage; sets <html dir>
```

## Relationships & lifecycle

- A **User** has many **ChatSessions**. Sessions are listed lean (summary) and fetched in full
  (detail with messages + user_profile) on open.
- A **ChatSession** has an ordered list of **Messages**. Assistant messages may carry
  **Charts**. A session gains a `title`/`route` after its first message (backend-driven);
  before that the UI shows a placeholder title.
- A **UserProfile** is derived by the backend from an uploaded **CV** and appears on the
  session detail once parsed. The frontend does not build it.
- **Credits** live on the User; each sent message consumes 1. The client reads them via `/me`
  and never mutates them.

## Validation rules (client-enforced before hitting the backend)

- Message `content`: non-empty, ≤ 8000 chars.
- CV upload: extension in `.pdf`/`.docx`/`.doc`; size ≤ 10 MiB (10 × 1024 × 1024). Reject
  inline without sending otherwise.
- `attached_cv_id`: only set from a successful upload's `file_id`; cleared if the user removes
  the attachment.

## State transitions — a chat turn

```
idle
  └─(send, no session)→ create session (POST /chat/new) ─┐
  └─(send, has session)────────────────────────────────┤
                                                        ▼
                                                   streaming
   text→append | status→toolStatus | chart→push | error→streamError (keep reading)
                                                        │
                                                     (done)
                                                        ▼
                              finalize: persist assistant message, clear buffers,
                              invalidate ['chat',id] & ['chats'], refetch ['me'] → idle
```

Pre-stream failure (403/429 before body) short-circuits `streaming` → surfaces via the
`ApiError`→UX mapper (redirect-login / banner / toast) and returns to `idle` without a partial
assistant message.
