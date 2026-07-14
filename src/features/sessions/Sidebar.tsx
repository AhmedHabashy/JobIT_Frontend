import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { useChats, useDeleteChat } from "@/api/sessions";
import { useMe } from "@/api/me";
import { useToast } from "@/components/ToastProvider";
import { ApiError } from "@/lib/apiError";
import { SessionListItem } from "@/features/sessions/SessionListItem";

/**
 * Workspace sidebar: New Chat, the user's session list (most-recent first), and
 * an identity footer. "New Chat" only routes to the empty /app state — the
 * backend session is created on the first message (deferred creation, FR-007).
 * Credits are added here in US5.
 */
export function Sidebar() {
  const navigate = useNavigate();
  const { sessionId: activeId } = useParams();
  const { user, signOut } = useAuth();
  const { data: sessions, isLoading, isError } = useChats();
  const { data: me } = useMe();
  const { showToast } = useToast();
  const deleteChat = useDeleteChat();

  const sorted = useMemo(
    () =>
      [...(sessions ?? [])].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      ),
    [sessions],
  );

  function handleDelete(id: string) {
    deleteChat.mutate(id, {
      onError: (err) =>
        showToast({
          message: ApiError.is(err) ? err.message : "Couldn't delete the conversation.",
          variant: "retryable",
          requestId: ApiError.is(err) ? err.request_id : undefined,
          onRetry: () => handleDelete(id),
        }),
    });
    if (id === activeId) navigate("/app", { replace: true });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-md flex items-center gap-sm">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary shrink-0">
          <span className="material-symbols-outlined text-[20px]">smart_toy</span>
        </div>
        <div className="min-w-0">
          <h1 className="font-title-sm text-title-sm text-primary leading-tight truncate">
            Career Coach
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant opacity-70">
            AI Assistant
          </p>
        </div>
      </div>

      <div className="px-sm">
        <button
          type="button"
          onClick={() => navigate("/app")}
          className="w-full flex items-center gap-base p-sm bg-secondary-container text-on-secondary-container rounded-lg active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">add_comment</span>
          <span className="font-body-sm text-body-sm">New Chat</span>
        </button>
      </div>

      <nav className="flex-1 px-sm mt-base overflow-y-auto space-y-xs">
        <div className="text-label-caps font-label-caps text-on-surface-variant px-sm py-xs opacity-50">
          HISTORY
        </div>
        {isLoading ? (
          <p className="px-sm py-xs font-body-sm text-body-sm text-on-surface-variant opacity-60">
            Loading…
          </p>
        ) : isError ? (
          <p className="px-sm py-xs font-body-sm text-body-sm text-error">
            Couldn't load conversations.
          </p>
        ) : sorted.length === 0 ? (
          <p className="px-sm py-xs font-body-sm text-body-sm text-on-surface-variant opacity-60">
            No conversations yet.
          </p>
        ) : (
          sorted.map((s) => (
            <SessionListItem
              key={s.session_id}
              session={s}
              active={s.session_id === activeId}
              onSelect={() => navigate(`/app/c/${s.session_id}`)}
              onDelete={() => handleDelete(s.session_id)}
            />
          ))
        )}
      </nav>

      <div className="p-md mt-auto border-t border-outline-variant space-y-sm">
        {me ? (
          <div className="flex items-center gap-xs bg-primary-container/10 rounded-lg px-sm py-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">toll</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              <span className="font-bold text-on-surface">{me.credits}</span> credit
              {me.credits === 1 ? "" : "s"} left
            </span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-sm">
          <div className="min-w-0 flex items-center gap-base">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                person
              </span>
            </div>
            <span
              className="font-body-sm text-body-sm truncate"
              title={user?.email ?? undefined}
            >
              {user?.email ?? "—"}
            </span>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => void signOut()}
            className="material-symbols-outlined text-[20px] text-on-surface-variant hover:text-primary shrink-0 p-xs -m-xs rounded-lg hover:bg-surface-container-high transition-colors"
          >
            logout
          </button>
        </div>
      </div>
    </div>
  );
}
