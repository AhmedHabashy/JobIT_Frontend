import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import type { UserOut } from "@/types/api";

/** GET /api/v1/me — identity + remaining credits. Never returns credits: 0. */
export function getMe(): Promise<UserOut> {
  return apiClient.get<UserOut>("/api/v1/me");
}

/**
 * Current user query. Rendered in the sidebar (email + credits). Refetched on
 * window focus (configured globally) and after each completed turn (US5).
 * Only used inside authed routes, so a session is guaranteed present.
 */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
  });
}
