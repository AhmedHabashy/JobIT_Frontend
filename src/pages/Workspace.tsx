import { Link, useParams } from "react-router-dom";
import { AppShell, useDrawer } from "@/components/AppShell";
import { useLanguage } from "@/i18n/LanguageProvider";
import { IconButton } from "@/components/ui/Button";
import { Brand } from "@/components/Brand";
import { useChats } from "@/api/sessions";
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
 * Top bar for the conversation pane. Rendered inside AppShell so the menu button
 * can reach the drawer via useDrawer() — the sidebar is a drawer at all widths,
 * so the button is always shown. The title mirrors the sidebar's session name
 * (same useChats source), falling back to the untitled placeholder / New chat.
 */
function WorkspaceHeader({ sessionId }: { sessionId: string | undefined }) {
  const { toggleLanguage, t } = useLanguage();
  const openDrawer = useDrawer();
  const { data: sessions } = useChats();

  const sessionTitle = sessions?.find((s) => s.session_id === sessionId)?.title.trim();
  const title = sessionId ? sessionTitle || t("session.untitled") : t("workspace.newChat");

  return (
    <header className="h-16 flex items-center gap-sm px-md border-b border-outline-variant bg-surface-container-low shrink-0">
      <IconButton
        icon="menu"
        label={t("workspace.openMenu")}
        onClick={openDrawer}
        className="-ms-xs"
      />
      <Link
        to="/"
        aria-label={t("workspace.home")}
        title={t("workspace.home")}
        className="shrink-0 hover:opacity-80 transition-opacity"
      >
        <Brand />
      </Link>
      <span className="h-6 w-px bg-outline-variant shrink-0 mx-xs" aria-hidden="true" />
      <h2 className="font-title-sm text-title-sm truncate flex-1 min-w-0 text-on-surface-variant">
        {title}
      </h2>
      <IconButton
        icon="translate"
        label={t("workspace.toggleLang")}
        onClick={toggleLanguage}
      />
    </header>
  );
}
