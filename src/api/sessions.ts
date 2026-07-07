import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import type {
  ChatSessionDetail,
  ChatSessionSummary,
  MessageRequest,
  SessionResponse,
} from "@/types/api";

/** POST /api/v1/chat/new — create an empty session (deferred to first send). */
export function createSession(): Promise<SessionResponse> {
  return apiClient.post<SessionResponse>("/api/v1/chat/new");
}

/** GET /api/v1/chats — lean session summaries for the sidebar. */
export function listChats(): Promise<ChatSessionSummary[]> {
  return apiClient.get<ChatSessionSummary[]>("/api/v1/chats");
}

/** GET /api/v1/chat/{id} — full detail (messages + charts + user_profile). */
export function getChat(sessionId: string): Promise<ChatSessionDetail> {
  return apiClient.get<ChatSessionDetail>(`/api/v1/chat/${sessionId}`);
}

/** DELETE /api/v1/chat/{id}. */
export function deleteChat(sessionId: string): Promise<{ status: string }> {
  return apiClient.del<{ status: string }>(`/api/v1/chat/${sessionId}`);
}

/**
 * POST /api/v1/chat/{id}/message — open the streaming turn. Returns the raw
 * Response so the caller pipes response.body through parseSSE. Pre-stream
 * failures (403/429) are thrown as ApiError before any bytes arrive.
 */
export function streamMessage(sessionId: string, body: MessageRequest): Promise<Response> {
  return apiClient.streamRequest(`/api/v1/chat/${sessionId}/message`, body);
}

/** Session list query (sidebar). */
export function useChats() {
  return useQuery({ queryKey: queryKeys.chats, queryFn: listChats });
}

/** Session detail query (message history). Disabled until a sessionId exists. */
export function useChat(sessionId: string | undefined) {
  return useQuery({
    queryKey: sessionId ? queryKeys.chat(sessionId) : ["chat", "none"],
    queryFn: () => getChat(sessionId as string),
    enabled: Boolean(sessionId),
  });
}
