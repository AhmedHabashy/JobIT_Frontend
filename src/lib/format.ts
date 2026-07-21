import type { Language } from "@/i18n/strings";

/**
 * Compact relative time for session "last updated" labels (e.g. "2h ago" /
 * "منذ ٢ س"). Frontend-generated, so it honors the active UI language; falls
 * back to a localized short date for anything older than a month.
 */
export function formatRelativeTime(iso: string, lang: Language = "en"): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (lang === "ar") {
    if (seconds < 45) return "الآن";
    if (minutes < 60) return `منذ ${minutes} د`;
    if (hours < 24) return `منذ ${hours} س`;
    if (days < 7) return `منذ ${days} ي`;
    if (weeks < 5) return `منذ ${weeks} أ`;
    return new Date(iso).toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
  }

  if (seconds < 45) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
