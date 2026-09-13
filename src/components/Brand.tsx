/**
 * The Jobit wordmark — the ECES crown mark plus "Job" in ink and "it" in
 * gradient, matching the landing page. The crown is a wide (2.23:1) lockup
 * element, so it is sized by height and left to find its own width. Purely
 * presentational; wrap it in a Link where it should act as a home button.
 */
export function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/eces-mark.png"
        alt=""
        aria-hidden="true"
        className="h-6 w-auto shrink-0"
      />
      <span className="text-[22px] font-extrabold tracking-tight leading-none text-on-surface">
        Job
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          it
        </span>
      </span>
    </span>
  );
}
