import { describe, it, expect } from "vitest";
import { ApiError, toUx } from "@/lib/apiError";
import type { ApiErrorCode } from "@/types/api";

function makeError(code: ApiErrorCode, httpStatus: number): ApiError {
  return new ApiError({
    code,
    message: `msg-${code}`,
    request_id: `req-${code}`,
    details: null,
    httpStatus,
  });
}

describe("toUx — every ApiErrorCode maps to a distinct directive", () => {
  it("resources_exhausted → persistent banner + blocks sending", () => {
    const ux = toUx(makeError("resources_exhausted", 429));
    expect(ux.kind).toBe("banner");
    if (ux.kind === "banner") expect(ux.blocksSending).toBe(true);
    expect(ux.requestId).toBe("req-resources_exhausted");
  });

  it("rate_limited → transient toast", () => {
    const ux = toUx(makeError("rate_limited", 429));
    expect(ux.kind).toBe("toast");
    if (ux.kind === "toast") expect(ux.variant).toBe("transient");
  });

  it("storage_unavailable → retryable toast", () => {
    const ux = toUx(makeError("storage_unavailable", 503));
    expect(ux.kind).toBe("toast");
    if (ux.kind === "toast") expect(ux.variant).toBe("retryable");
  });

  it("internal_error → retryable toast", () => {
    const ux = toUx(makeError("internal_error", 500));
    expect(ux.kind).toBe("toast");
    if (ux.kind === "toast") expect(ux.variant).toBe("retryable");
  });

  it("forbidden → redirect to login", () => {
    const ux = toUx(makeError("forbidden", 403));
    expect(ux.kind).toBe("redirect-login");
  });

  it("validation_failed → inline error", () => {
    const ux = toUx(makeError("validation_failed", 400));
    expect(ux.kind).toBe("inline");
  });

  it("cv_parsing_failed → inline error", () => {
    const ux = toUx(makeError("cv_parsing_failed", 422));
    expect(ux.kind).toBe("inline");
  });

  it("not_found → not-found directive", () => {
    const ux = toUx(makeError("not_found", 404));
    expect(ux.kind).toBe("not-found");
  });

  it("every directive carries request_id and message", () => {
    const codes: ApiErrorCode[] = [
      "validation_failed",
      "forbidden",
      "not_found",
      "cv_parsing_failed",
      "rate_limited",
      "resources_exhausted",
      "storage_unavailable",
      "internal_error",
    ];
    for (const code of codes) {
      const ux = toUx(makeError(code, 400));
      expect(ux.requestId).toBe(`req-${code}`);
      expect(ux.message).toBe(`msg-${code}`);
    }
  });
});

describe("ApiError", () => {
  it("is an Error with the contract fields attached", () => {
    const err = makeError("rate_limited", 429);
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("rate_limited");
    expect(err.httpStatus).toBe(429);
    expect(err.request_id).toBe("req-rate_limited");
  });

  it("isApiError narrows unknown values", () => {
    expect(ApiError.is(makeError("forbidden", 403))).toBe(true);
    expect(ApiError.is(new Error("plain"))).toBe(false);
    expect(ApiError.is(null)).toBe(false);
  });
});
