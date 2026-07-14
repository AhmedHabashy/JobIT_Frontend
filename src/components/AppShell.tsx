import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

/** Lets any descendant (e.g. the workspace header) open the mobile drawer. */
const DrawerContext = createContext<() => void>(() => {});

// eslint-disable-next-line react-refresh/only-export-components
export function useDrawer() {
  return useContext(DrawerContext);
}

/**
 * Workspace layout: a fixed sidebar + a main work area. Uses logical properties
 * (start/end, border-s) so it mirrors correctly under RTL.
 *
 * The sidebar is a permanent rail on md+; on small screens it collapses into an
 * off-canvas drawer opened from the header (useDrawer) and dismissed by the
 * scrim, Escape, or navigating to a session — so phones keep full access to
 * history, credits, and sign-out.
 */
export function AppShell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Any navigation (selecting/deleting a session, New Chat) closes the drawer.
  useEffect(() => setDrawerOpen(false), [location.pathname]);

  // Escape closes the drawer while it's open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <DrawerContext.Provider value={() => setDrawerOpen(true)}>
      <div className="flex h-screen overflow-hidden bg-surface">
        {/* Permanent rail (md+) */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 border-e border-outline-variant bg-surface-container-low">
          {sidebar}
        </aside>

        {/* Mobile off-canvas drawer */}
        <div
          className={`fixed inset-0 z-40 bg-inverse-surface/40 backdrop-blur-[1px] transition-opacity md:hidden ${
            drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={`fixed inset-y-0 start-0 z-50 flex w-72 max-w-[85%] flex-col border-e border-outline-variant bg-surface-container-low shadow-xl transition-transform duration-200 ease-out md:hidden ${
            drawerOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          aria-hidden={!drawerOpen}
        >
          {sidebar}
        </aside>

        <main className="flex-1 flex flex-col min-w-0 relative">{children}</main>
      </div>
    </DrawerContext.Provider>
  );
}
