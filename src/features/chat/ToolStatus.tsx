import { useLanguage } from "@/i18n/LanguageProvider";

/** Transient "using {tool}…" indicator shown while the agent runs a tool. */
export function ToolStatus({ tool }: { tool: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-xs text-on-surface-variant font-body-sm text-body-sm">
      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
      <span>
        {t("chat.using")} <span className="font-bold">{tool}</span>…
      </span>
    </div>
  );
}
