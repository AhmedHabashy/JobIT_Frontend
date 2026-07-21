import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { UploadResponse } from "@/types/api";

export const MAX_CV_BYTES = 10 * 1024 * 1024; // 10 MiB
export const ALLOWED_CV_EXTENSIONS = [".pdf", ".docx", ".doc"] as const;

/** Reason a file failed client-side pre-validation (translated at the UI). */
export type CvValidationError = "unsupported_type" | "too_large";

/**
 * Client-side pre-validation so obviously-bad files are rejected inline without
 * a round-trip (FR-022). Returns an error code, or null if the file is OK. The
 * backend re-validates authoritatively.
 */
export function validateCvFile(file: File): CvValidationError | null {
  const name = file.name.toLowerCase();
  const ok = ALLOWED_CV_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!ok) return "unsupported_type";
  if (file.size > MAX_CV_BYTES) return "too_large";
  return null;
}

/** POST /api/v1/upload — multipart, field name `file`. Returns { file_id, filename }. */
export function uploadCv(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  return apiClient.postForm<UploadResponse>("/api/v1/upload", form);
}

export function useUploadCv() {
  return useMutation({ mutationFn: uploadCv });
}
