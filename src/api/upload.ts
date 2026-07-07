import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { UploadResponse } from "@/types/api";

export const MAX_CV_BYTES = 10 * 1024 * 1024; // 10 MiB
export const ALLOWED_CV_EXTENSIONS = [".pdf", ".docx", ".doc"] as const;

/**
 * Client-side pre-validation so obviously-bad files are rejected inline without
 * a round-trip (FR-022). Returns an error message, or null if the file is OK.
 * The backend re-validates authoritatively.
 */
export function validateCvFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const ok = ALLOWED_CV_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!ok) {
    return `Unsupported file type. Allowed: ${ALLOWED_CV_EXTENSIONS.join(", ")}.`;
  }
  if (file.size > MAX_CV_BYTES) {
    return "File is too large. Maximum size is 10 MiB.";
  }
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
