import type { ReactNode } from "react";
import type { Chart, Message } from "@/types/api";
import { PlotlyChart } from "@/features/chat/PlotlyChart";

function Avatar({ role }: { role: Message["role"] }) {
  if (role === "assistant") {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center text-on-primary shadow-md shadow-primary/30">
        <span className="material-symbols-outlined">smart_toy</span>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-surface-container-high shrink-0 flex items-center justify-center border border-outline-variant">
      <span className="material-symbols-outlined text-on-surface-variant">person</span>
    </div>
  );
}

/**
 * One chat turn. Assistant messages render on the start side with a white card
 * and any charts inline; user messages render on the end side in a primary
 * bubble. Logical properties (start/end) mirror correctly under RTL.
 */
export function MessageBubble({
  role,
  content,
  charts,
  children,
}: {
  role: Message["role"];
  content: ReactNode;
  charts?: Chart[] | null;
  children?: ReactNode;
}) {
  const isAssistant = role === "assistant";

  return (
    <div className={`flex gap-md max-w-3xl ${isAssistant ? "" : "ms-auto flex-row-reverse"}`}>
      <Avatar role={role} />
      <div className={`space-y-sm min-w-0 ${isAssistant ? "" : "flex flex-col items-end"}`}>
        <div
          className={
            isAssistant
              ? "bg-surface-container-lowest p-md rounded-xl border border-outline-variant"
              : "bg-primary text-on-primary p-md rounded-xl inline-block"
          }
        >
          {content ? (
            <p className="font-body-md text-body-md whitespace-pre-wrap break-words">{content}</p>
          ) : null}
          {isAssistant && charts && charts.length > 0
            ? charts.map((chart, i) => <PlotlyChart key={i} chart={chart} />)
            : null}
          {children}
        </div>
      </div>
    </div>
  );
}
