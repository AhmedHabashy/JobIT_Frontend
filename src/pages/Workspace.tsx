import { Link, useParams } from "react-router-dom";
import { AppShell, useDrawer } from "@/components/AppShell";
import { useLanguage } from "@/i18n/LanguageProvider";
import { IconButton } from "@/components/ui/Button";
import { Brand } from "@/components/Brand";
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
  const { toggleLanguage, t } = useLanguage();
  const openDrawer = useDrawer();

  return (
    <header className="h-16 flex items-center gap-sm px-md border-b border-outline-variant bg-surface-container-low shrink-0">
      <IconButton
        icon="menu"
        label={t("workspace.openMenu")}
        onClick={openDrawer}
        className="md:hidden -ms-xs"
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
        {sessionId ? `${t("workspace.session")} ${sessionId.slice(0, 8)}…` : t("workspace.newChat")}
      </h2>
      <IconButton
        icon="translate"
        label={t("workspace.toggleLang")}
        onClick={toggleLanguage}
      />
    </header>
  );
}
