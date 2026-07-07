import type { ApiErrorBody, ApiErrorCode } from "@/types/api";

/**
 * A typed backend error carrying the ApiError body (code/message/request_id/
 * details) plus the HTTP status. Thrown by the api client on any non-2xx and by
 * the streaming hook for in-stream `error` frames. (Constitution Principle IV.)
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly request_id: string;
  readonly details: unknown | null;
  readonly httpStatus: number;

  constructor(body: ApiErrorBody & { httpStatus: number }) {
    super(body.message);
    this.name = "ApiError";
    this.code = body.code;
    this.request_id = body.request_id;
    this.details = body.details;
    this.httpStatus = body.httpStatus;
    // Restore prototype chain for instanceof across transpile targets.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static is(value: unknown): value is ApiError {
    return value instanceof ApiError;
  }
}

/**
 * The UX directive a surfaced error resolves to. One authoritative mapping so
 * codes never collapse into a generic error (constitution review gate).
 */
export type UxDirective =
  | { kind: "banner"; blocksSending: true; requestId: string; message: string; code: ApiErrorCode }
  | {
      kind: "toast";
      variant: "transient" | "retryable";
      requestId: string;
      message: string;
      code: ApiErrorCode;
    }
  | { kind: "redirect-login"; requestId: string; message: string; code: ApiErrorCode }
  | { kind: "inline"; requestId: string; message: string; code: ApiErrorCode }
  | { kind: "not-found"; requestId: string; message: string; code: ApiErrorCode };

/**
 * Map an ApiError to its distinct UX outcome:
 * - resources_exhausted → persistent out-of-credits banner + block sending
 * - rate_limited        → transient toast
 * - storage_unavailable / internal_error → retryable toast
 * - forbidden           → route to login / deactivated notice
 * - validation_failed / cv_parsing_failed → inline field error
 * - not_found           → not-found state
 */
export function toUx(error: ApiError): UxDirective {
  const base = { requestId: error.request_id, message: error.message, code: error.code } as const;

  switch (error.code) {
    case "resources_exhausted":
      return { kind: "banner", blocksSending: true, ...base };
    case "rate_limited":
      return { kind: "toast", variant: "transient", ...base };
    case "storage_unavailable":
    case "internal_error":
      return { kind: "toast", variant: "retryable", ...base };
    case "forbidden":
      return { kind: "redirect-login", ...base };
    case "validation_failed":
    case "cv_parsing_failed":
      return { kind: "inline", ...base };
    case "not_found":
      return { kind: "not-found", ...base };
    default: {
      // Exhaustiveness guard: adding a new code without handling it is a compile error.
      const _never: never = error.code;
      return { kind: "toast", variant: "retryable", ...base, code: _never };
    }
  }
}
