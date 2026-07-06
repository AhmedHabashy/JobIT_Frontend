/**
 * Placeholder scaffold shell.
 *
 * This is intentionally minimal so `npm run dev` boots and the Stitch design
 * tokens (colors, Geist, Material Symbols) are verifiable. It is replaced in
 * Phase 2 Foundational (task T022) by the real provider + router tree
 * (QueryClientProvider, AuthProvider, DirectionProvider, ToastProvider, Banner).
 */
export default function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-md px-margin-mobile text-center">
      <div className="inline-flex items-center gap-xs bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full">
        <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
        <span className="font-label-caps text-label-caps">SCAFFOLD READY</span>
      </div>
      <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary">
        Jobit
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
        Project scaffold is up. Design system tokens are wired. Implementation begins at
        Phase&nbsp;2 (Foundational) per <code>specs/001-jobit-web-app/tasks.md</code>.
      </p>
    </main>
  );
}
