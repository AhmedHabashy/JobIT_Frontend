/** Transient "using {tool}…" indicator shown while the agent runs a tool. */
export function ToolStatus({ tool }: { tool: string }) {
  return (
    <div className="flex items-center gap-xs text-on-surface-variant font-body-sm text-body-sm">
      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
      <span>
        using <span className="font-bold">{tool}</span>…
      </span>
    </div>
  );
}
