import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, toUx } from "@/lib/apiError";
import { queryKeys } from "@/lib/queryKeys";
import { useChat } from "@/api/sessions";
import { useChatStream } from "@/features/chat/useChatStream";
import { MessageList } from "@/features/chat/MessageList";
import { Composer } from "@/features/chat/Composer";
import { useToast } from "@/components/ToastProvider";
import { useCredits } from "@/components/Banner";
import { useLanguage } from "@/i18n/LanguageProvider";
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
  const { t } = useLanguage();

  const chatQuery = useChat(sessionId);
  const [messages, setMessages] = useState<Message[]>([]);
  // Content of the assistant message to type out once (set on `done`).
  const [revealContent, setRevealContent] = useState<string | null>(null);

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
    setRevealContent(null);
  }, [sessionId]);

  // Reconcile with server truth whenever history loads/refetches — but never
  // mid-stream, nor while the just-finished answer is still typing out (the
  // refetch would replace the message and snap it to full).
  useEffect(() => {
    if (streamingNowRef.current || revealContent !== null) return;
    if (chatQuery.data) setMessages(chatQuery.data.messages);
  }, [chatQuery.data, revealContent]);

  const onUserMessage = useCallback((msg: Message) => {
    setRevealContent(null);
    setMessages((prev) => [...prev, msg]);
  }, []);
  const onAssistantMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
    setRevealContent(msg.content); // types out once in MessageList
  }, []);

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

  // Session deleted elsewhere / invalid id → not-found state (FR: not_found).
  const notFound =
    !isStreaming &&
    Boolean(sessionId) &&
    ApiError.is(chatQuery.error) &&
    chatQuery.error.code === "not_found";

  if (notFound) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-sm text-center p-md">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant opacity-60">
          search_off
        </span>
        <p className="font-title-sm text-title-sm">{t("chat.notFoundTitle")}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
          {t("chat.notFoundBody")}
        </p>
        <button
          type="button"
          onClick={() => navigate("/app", { replace: true })}
          className="mt-sm bg-primary text-on-primary rounded-lg px-md py-sm font-title-sm text-body-md hover:bg-primary-hover transition-colors"
        >
          {t("chat.startNew")}
        </button>
      </div>
    );
  }

  const profile = chatQuery.data?.user_profile ?? null;

  return (
    <>
      {profile ? (
        <div className="shrink-0 px-md py-sm border-b border-outline-variant bg-surface-container-low flex items-center gap-xs flex-wrap">
          <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {t("chat.cvProfile")}
          </span>
          {profile.job_titles.slice(0, 2).map((t) => (
            <span
              key={t}
              className="font-body-sm text-body-sm bg-secondary-container text-on-secondary-container rounded-full px-sm py-[2px]"
            >
              {t}
            </span>
          ))}
          {profile.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="font-body-sm text-body-sm bg-surface-container-high text-on-surface-variant rounded-full px-sm py-[2px]"
            >
              {s}
            </span>
          ))}
          {profile.skills.length > 4 ? (
            <span className="font-body-sm text-body-sm text-on-surface-variant opacity-70">
              +{profile.skills.length - 4} {t("chat.more")}
            </span>
          ) : null}
        </div>
      ) : null}
      <MessageList
        messages={messages}
        revealContent={revealContent}
        onRevealComplete={() => setRevealContent(null)}
        streaming={{
          active: isStreaming,
          text: streamingText,
          charts: streamingCharts,
          toolStatus,
        }}
      />
      <Composer
        disabled={isStreaming || isOutOfCredits}
        blockedReason={isOutOfCredits ? t("chat.outOfCreditsShort") : null}
        onSend={(content, attachedCvId) => void send(content, attachedCvId)}
      />
    </>
  );
}
