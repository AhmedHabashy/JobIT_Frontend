import type { ChatSessionSummary } from "@/types/api";
import { formatRelativeTime } from "@/lib/format";

interface SessionListItemProps {
  session: ChatSessionSummary;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

/**
 * One session row. A blank backend title (freshly created / not yet titled)
 * shows a neutral placeholder rather than an empty row (FR-009).
 */
export function SessionListItem({ session, active, onSelect, onDelete }: SessionListItemProps) {
  const title = session.title.trim() || "New conversation";

  return (
    <div
      className={`group flex items-center gap-base rounded-lg px-sm py-sm transition-colors cursor-pointer ${
        active
          ? "bg-secondary-container text-on-secondary-container"
          : "text-on-surface-variant hover:bg-surface-container-high"
      }`}
      onClick={onSelect}
    >
      <span className="material-symbols-outlined text-[18px] shrink-0">chat_bubble</span>
      <div className="min-w-0 flex-1">
        <p className="font-body-sm text-body-sm truncate" title={title}>
          {title}
        </p>
        {session.updated_at ? (
          <p className="font-label-caps text-[11px] opacity-60">
            {formatRelativeTime(session.updated_at)}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Delete conversation"
        title="Delete conversation"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="material-symbols-outlined text-[18px] shrink-0 p-xs -m-xs opacity-60 hover:text-error md:opacity-0 md:group-hover:opacity-70 md:hover:!opacity-100 transition-opacity"
      >
        delete
      </button>
    </div>
  );
}
