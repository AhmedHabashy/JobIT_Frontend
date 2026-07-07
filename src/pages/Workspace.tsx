import { useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/auth/AuthProvider";
import { useDirection } from "@/i18n/DirectionProvider";
import { IconButton } from "@/components/ui/Button";
import { ChatView } from "@/features/chat/ChatView";

/**
 * Authenticated workspace: sidebar + a session's conversation. The full session
 * list (US3), credits (US5), and CV upload (US4) fill the sidebar/composer in
 * later phases; US2 delivers the streaming chat view.
 */
export default function Workspace() {
  const { sessionId } = useParams();
  const { user, signOut } = useAuth();
  const { toggleDirection, isRtl } = useDirection();

  return (
    <AppShell
      sidebar={
        <div className="flex flex-col h-full p-md">
          <div className="font-title-sm text-title-sm text-primary">Career Coach</div>
          <div className="mt-md font-label-caps text-label-caps text-on-surface-variant opacity-60">
            HISTORY
          </div>
          <p className="mt-sm font-body-sm text-body-sm text-on-surface-variant opacity-70">
            Session list arrives in US3.
          </p>
          <div className="mt-auto pt-md border-t border-outline-variant">
            <p className="font-body-sm text-body-sm truncate" title={user?.email ?? undefined}>
              {user?.email ?? "—"}
            </p>
            <button
              type="button"
              onClick={() => void signOut()}
              className="mt-xs font-label-caps text-label-caps text-primary hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      }
    >
      <header className="h-16 flex items-center justify-between px-md border-b border-outline-variant shrink-0">
        <h2 className="font-title-sm text-title-sm">
          {sessionId ? `Session ${sessionId.slice(0, 8)}…` : "New chat"}
        </h2>
        <IconButton
          icon="translate"
          label={isRtl ? "Switch to LTR" : "Switch to RTL"}
          onClick={toggleDirection}
        />
      </header>
      <ChatView sessionId={sessionId} />
    </AppShell>
  );
}
