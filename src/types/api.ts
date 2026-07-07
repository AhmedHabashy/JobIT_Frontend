/**
 * TypeScript shapes mirroring the JobIT backend contract (api_docs/API.md /
 * /openapi.json) plus the SSE frame types. Source of truth is the contract; if
 * it and /openapi.json disagree, /openapi.json wins.
 *
 * See specs/001-jobit-web-app/data-model.md.
 */

// ── Identity & credits (GET /api/v1/me) ──────────────────────────────────────
export interface UserOut {
  id: string; // Supabase user UUID (== local user id)
  email: string;
  role: "user" | "admin";
  credits: number; // always >= 1 in a 200 response (never 0)
}

// ── Sessions ────────────────────────────────────────────────────────────────
export interface ChatSessionSummary {
  session_id: string; // UUID
  created_at: string; // ISO-8601 UTC
  updated_at: string; // ISO-8601 UTC
  route: string; // "" until first message classified
  title: string; // "" until title generated -> show placeholder
  summary: string; // "" until conversation exceeds window_size
  window_size: number;
}

export interface ChatSessionDetail extends ChatSessionSummary {
  user_profile: UserProfile | null; // null until a CV is parsed in this session
  messages: Message[];
}

// ── Messages & charts ───────────────────────────────────────────────────────
export interface Message {
  role: "user" | "assistant";
  content: string;
  charts: Chart[] | null; // null when no charts; same shape as live `chart` frames
}

export interface Chart {
  plotly_json: string; // serialized Plotly figure ({data, layout}) — JSON.parse before render
  rtl: boolean; // true => render RTL regardless of app direction
}

// ── CV-derived profile ──────────────────────────────────────────────────────
export interface UserProfile {
  skills: string[];
  job_titles: string[];
  experience: string; // e.g. "3 years"
  core_tasks: string[];
  education_level: string; // e.g. "bachelor"
}

// ── Upload / session creation ───────────────────────────────────────────────
export interface UploadResponse {
  file_id: string; // pass as attached_cv_id on the next message
  filename: string;
}

export interface SessionResponse {
  session_id: string;
}

export interface StatusResponse {
  status: string; // e.g. "deleted"
}

// ── Outgoing message ────────────────────────────────────────────────────────
export interface MessageRequest {
  content: string; // 1..8000 chars
  attached_cv_id: string | null;
}

// ── Errors (all non-2xx bodies share this shape) ────────────────────────────
export type ApiErrorCode =
  | "validation_failed" // 400
  | "forbidden" // 403
  | "not_found" // 404
  | "cv_parsing_failed" // 422
  | "rate_limited" // 429
  | "resources_exhausted" // 429
  | "storage_unavailable" // 503
  | "internal_error"; // 500

/** The JSON body of an error response (ApiError model). */
export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
  request_id: string;
  details: unknown | null;
}

// ── SSE frames (live turn) ──────────────────────────────────────────────────
export interface TextEventData {
  content: string;
}
export interface StatusEventData {
  tool: string;
}
export type ChartEventData = Chart;
export type ErrorEventData = ApiErrorBody;
export interface DoneEventData {
  message_id: string;
}

export type SseEvent =
  | { event: "text"; data: TextEventData }
  | { event: "status"; data: StatusEventData }
  | { event: "chart"; data: ChartEventData }
  | { event: "error"; data: ErrorEventData }
  | { event: "done"; data: DoneEventData };

/** A raw parsed frame before it is narrowed to a known SseEvent. */
export interface RawSseFrame {
  event: string;
  data: string;
}
