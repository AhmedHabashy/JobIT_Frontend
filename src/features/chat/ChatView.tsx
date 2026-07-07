import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import { toUx } from "@/lib/apiError";
import { queryKeys } from "@/lib/queryKeys";
import { useChat } from "@/api/sessions";
import { useChatStream } from "@/features/chat/useChatStream";
import { MessageList } from "@/features/chat/MessageList";
import { Composer } from "@/features/chat/Composer";
import { useToast } from "@/components/ToastProvider";
import { useCredits } from "@/components/Banner";
import type { Message } from "@/types/api";

/**
 * A single session's conversation. Server (useChat) is the source of truth for
 * committed messages; the in-flight turn is held locally by useChatStream and
 * committed optimistically, then reconciled when the server refetch returns.
 * Handles deferred creation: a new chat (no sessionId) creates the session on
 * first send, then navigates to /app/c/{id} without remounting.
 */
export function ChatView({ sessionId }: { sessionId: string | undefined }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { isOutOfCredits, markOutOfCredits } = useCredits();

  const chatQuery = useChat(sessionId);
  const [messages, setMessages] = useState<Message[]>([]);

  // Distinguishes a sessionId change we caused (deferred create) from the user
  // switching to a different session — the former must NOT wipe the live turn.
  const justCreatedRef = useRef<string | null>(null);
  const streamingNowRef = useRef(false);

  // Switching to a different existing session clears the view; a self-created
  // session id keeps the in-flight optimistic messages.
  useEffect(() => {
    if (justCreatedRef.current === sessionId) {
      justCreatedRef.current = null;
      return;
    }
    setMessages([]);
  }, [sessionId]);

  // Reconcile with server truth whenever history loads/refetches — but never
  // mid-stream (an in-flight refetch could return before the turn persists).
  useEffect(() => {
    if (streamingNowRef.current) return;
    if (chatQuery.data) setMessages(chatQuery.data.messages);
  }, [chatQuery.data]);

  const onUserMessage = useCallback((msg: Message) => setMessages((prev) => [...prev, msg]), []);
  const onAssistantMessage = useCallback(
    (msg: Message) => setMessages((prev) => [...prev, msg]),
    [],
  );

  const onSessionCreated = useCallback(
    (id: string) => {
      justCreatedRef.current = id;
      navigate(`/app/c/${id}`, { replace: true });
    },
    [navigate],
  );

  const onDone = useCallback(
    (sid: string) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chats });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat(sid) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.me }); // credit consumed
    },
    [queryClient],
  );

  const onError = useCallback(
    (err: ApiError) => {
      const ux = toUx(err);
      switch (ux.kind) {
        case "banner":
          markOutOfCredits(ux.requestId);
          break;
        case "toast":
          showToast({ message: ux.message, variant: ux.variant, requestId: ux.requestId });
          break;
        case "inline":
        case "not-found":
          showToast({ message: ux.message, variant: "retryable", requestId: ux.requestId });
          break;
        case "redirect-login":
          // Already handled globally by ApiErrorBridge (sign out + /login).
          break;
      }
    },
    [markOutOfCredits, showToast],
  );

  const { isStreaming, streamingText, streamingCharts, toolStatus, send } = useChatStream({
    sessionId,
    onSessionCreated,
    onUserMessage,
    onAssistantMessage,
    onDone,
    onError,
  });
  streamingNowRef.current = isStreaming;

  return (
    <>
      <MessageList
        messages={messages}
        streaming={{
          active: isStreaming,
          text: streamingText,
          charts: streamingCharts,
          toolStatus,
        }}
      />
      <Composer
        disabled={isStreaming || isOutOfCredits}
        blockedReason={isOutOfCredits ? "You are out of credits. Sending is disabled." : null}
        onSend={(content) => void send(content, null)}
      />
    </>
  );
}
