import { useParams } from "react-router-dom";
import { AppShell, useDrawer } from "@/components/AppShell";
import { useDirection } from "@/i18n/DirectionProvider";
import { IconButton } from "@/components/ui/Button";
import { Sidebar } from "@/features/sessions/Sidebar";
import { ChatView } from "@/features/chat/ChatView";

/**
 * Authenticated workspace: sidebar (session list + identity) + a session's
 * conversation. Credits (US5) and CV upload (US4) are added later.
 */
export default function Workspace() {
  const { sessionId } = useParams();

  return (
    <AppShell sidebar={<Sidebar />}>
      <WorkspaceHeader sessionId={sessionId} />
      <ChatView sessionId={sessionId} />
    </AppShell>
  );
}

/**
 * Top bar for the conversation pane. Rendered inside AppShell so the mobile menu
 * button can reach the drawer via useDrawer(); the button only shows below md,
 * where the sidebar rail is collapsed.
 */
function WorkspaceHeader({ sessionId }: { sessionId: string | undefined }) {
  const { toggleDirection, isRtl } = useDirection();
  const openDrawer = useDrawer();

  return (
    <header className="h-16 flex items-center gap-sm px-md border-b border-outline-variant bg-surface-container-low shrink-0">
      <IconButton
        icon="menu"
        label="Open menu"
        onClick={openDrawer}
        className="md:hidden -ms-xs"
      />
      <h2 className="font-title-sm text-title-sm truncate flex-1 min-w-0">
        {sessionId ? `Session ${sessionId.slice(0, 8)}…` : "New chat"}
      </h2>
      <IconButton
        icon="translate"
        label={isRtl ? "Switch to LTR" : "Switch to RTL"}
        onClick={toggleDirection}
      />
    </header>
  );
}
