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
 * Workspace layout: an off-canvas sidebar drawer + a main work area. Uses
 * logical properties (start/end, border-s) so it mirrors correctly under RTL.
 *
 * The sidebar is a slide-in drawer at ALL widths (desktop included) — opened
 * from the header menu button (useDrawer) and dismissed by the scrim, Escape,
 * or navigating to a session. The main view is `app-canvas`, which zooms out a
 * touch on larger screens so more of the conversation fits on screen.
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
        {/* Scrim */}
        <div
          className={`fixed inset-0 z-40 bg-inverse-surface/40 backdrop-blur-[1px] transition-opacity ${
            drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />

        {/* Off-canvas drawer (all widths) */}
        <aside
          className={`fixed inset-y-0 start-0 z-50 flex w-72 max-w-[85%] flex-col border-e border-outline-variant bg-surface-container-low shadow-xl transition-transform duration-200 ease-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          aria-hidden={!drawerOpen}
        >
          {sidebar}
        </aside>

        <main className="app-canvas flex-1 flex flex-col min-w-0 relative">{children}</main>
      </div>
    </DrawerContext.Provider>
  );
}
