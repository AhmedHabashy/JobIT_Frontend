import { useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
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
  const { toggleDirection, isRtl } = useDirection();

  return (
    <AppShell sidebar={<Sidebar />}>
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
