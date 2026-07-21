/**
 * The Jobit wordmark — a blue→cyan gradient mark plus "Job" in ink and "it" in
 * gradient, matching the landing page. Purely presentational; wrap it in a Link
 * where it should act as a home button.
 */
export function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center shadow-md shadow-primary/40 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-white" />
      </span>
      <span className="text-[22px] font-extrabold tracking-tight leading-none text-on-surface">
        Job
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          it
        </span>
      </span>
    </span>
  );
}
