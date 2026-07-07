/**
 * Centralized React Query keys so cache reads/writes/invalidations stay
 * consistent across the app. (Constitution Principle III — clean typed state.)
 */
export const queryKeys = {
  me: ["me"] as const,
  chats: ["chats"] as const,
  chat: (sessionId: string) => ["chat", sessionId] as const,
};
