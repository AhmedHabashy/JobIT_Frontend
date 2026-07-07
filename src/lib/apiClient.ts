import { supabase } from "@/lib/supabase";
import { ApiError } from "@/lib/apiError";
import type { ApiErrorBody } from "@/types/api";

/**
 * Resolve the API base URL, with a hard production/dev split:
 *
 * - DEV: return "" so calls are same-origin ("/api/...") and the Vite dev proxy
 *   forwards them to the backend server-side (avoids browser CORS — localhost is
 *   not in the backend's AUTH__ALLOWED_ORIGINS). This proxy exists ONLY in the
 *   dev server.
 * - PROD: require an absolute http(s) URL and call the backend directly. We never
 *   fall back to the relative "/api" path in production: that dev-only proxy is
 *   gone, and on static hosting "/api/*" would match the SPA redirect and return
 *   index.html, silently corrupting every response. Fail fast instead.
 *
 * Counter-measure #3 (defense in depth) — even if a misconfigured build slipped
 * past the build-time guard in vite.config.ts, this throws on first load.
 */
function resolveBaseUrl(): string {
  if (import.meta.env.DEV) return "";
  const url = import.meta.env.VITE_API_BASE_URL;
  if (!url || !/^https?:\/\//i.test(url)) {
    throw new Error(
      "VITE_API_BASE_URL must be an absolute http(s) URL in production " +
        "(the dev proxy is unavailable). See .env.example.",
    );
  }
  return url.replace(/\/+$/, ""); // strip any trailing slash
}

const BASE_URL = resolveBaseUrl();

/**
 * App-level side-effect handlers for cross-cutting error codes. Registered once
 * at startup (by the providers) so the lib stays decoupled from React / router:
 * - onForbidden: sign out + route to /login (403).
 * - onResourcesExhausted: flip the global out-of-credits banner (429).
 */
interface ApiErrorHandlers {
  onForbidden?: (err: ApiError) => void;
  onResourcesExhausted?: (err: ApiError) => void;
}
let handlers: ApiErrorHandlers = {};
export function setApiErrorHandlers(next: ApiErrorHandlers): void {
  handlers = next;
}

function newRequestId(): string {
  // crypto.randomUUID is available in all supported browsers.
  return crypto.randomUUID();
}

/** Read the CURRENT session token fresh — never cache it (Principle I). */
async function authHeaders(requestId: string): Promise<Headers> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers();
  headers.set("X-Request-ID", requestId);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

/** Build an ApiError from a non-2xx response, then fire global side effects. */
async function toApiError(res: Response, requestId: string): Promise<ApiError> {
  let body: Partial<ApiErrorBody> = {};
  try {
    body = (await res.json()) as Partial<ApiErrorBody>;
  } catch {
    // Non-JSON error body — synthesize from status.
  }
  const err = new ApiError({
    code: body.code ?? "internal_error",
    message: body.message ?? `Request failed (${res.status})`,
    request_id: body.request_id ?? res.headers.get("X-Request-ID") ?? requestId,
    details: body.details ?? null,
    httpStatus: res.status,
  });
  fireSideEffects(err);
  return err;
}

function fireSideEffects(err: ApiError): void {
  if (err.code === "forbidden") handlers.onForbidden?.(err);
  else if (err.code === "resources_exhausted") handlers.onResourcesExhausted?.(err);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const requestId = newRequestId();
  const headers = await authHeaders(requestId);

  // Only set JSON content type when we send a non-FormData body.
  const isForm = init.body instanceof FormData;
  if (init.body && !isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  // Merge any caller-provided headers.
  if (init.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) throw await toApiError(res, requestId);

  // 200 with an empty body (rare) → undefined.
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "POST", body: form }),

  /**
   * Open a streaming POST (SSE). Injects the same fresh Bearer + X-Request-ID.
   * Returns the raw Response so the caller can pipe response.body through the
   * SSE parser. Pre-stream failures (403/429 etc.) are thrown as ApiError here,
   * BEFORE any streaming begins (Principle II — the two failure paths).
   */
  async streamRequest(path: string, body: unknown): Promise<Response> {
    const requestId = newRequestId();
    const headers = await authHeaders(requestId);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "text/event-stream");

    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await toApiError(res, requestId);
    return res;
  },
};
