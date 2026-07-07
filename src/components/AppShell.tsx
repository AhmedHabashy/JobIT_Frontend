import type { ReactNode } from "react";

/**
 * Workspace layout: a fixed sidebar + a main work area. Uses logical properties
 * (start/end, border-s) so it mirrors correctly under RTL. Sidebar content and
 * the top bar are provided by the caller (Sidebar in US3, header in US2/US6).
 */
export function AppShell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-e border-outline-variant bg-surface-container-low">
        {sidebar}
      </aside>
      <main className="flex-1 flex flex-col min-w-0 relative">{children}</main>
    </div>
  );
}
