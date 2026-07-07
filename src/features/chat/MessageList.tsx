import { useEffect, useRef } from "react";
import type { Chart, Message } from "@/types/api";
import { MessageBubble } from "@/features/chat/MessageBubble";
import { ToolStatus } from "@/features/chat/ToolStatus";
import { PlotlyChart } from "@/features/chat/PlotlyChart";

interface MessageListProps {
  messages: Message[];
  /** In-flight assistant turn (rendered after committed messages). */
  streaming: {
    active: boolean;
    text: string;
    charts: Chart[];
    toolStatus: string | null;
  };
}

/** Scrollable conversation: committed messages + the live streaming bubble. */
export function MessageList({ messages, streaming }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming.text, streaming.charts.length, streaming.toolStatus, streaming.active]);

  const empty = messages.length === 0 && !streaming.active;

  return (
    <section className="flex-1 overflow-y-auto p-md flex flex-col gap-lg max-w-max-width-content mx-auto w-full">
      {empty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-sm">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined">smart_toy</span>
          </div>
          <p className="font-title-sm text-title-sm">How can I help with your career today?</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
            Ask about salaries, in-demand skills, or Egyptian labour law — or attach your CV for
            tailored guidance.
          </p>
        </div>
      ) : null}

      {messages.map((m, i) => (
        <MessageBubble key={i} role={m.role} content={m.content} charts={m.charts} />
      ))}

      {streaming.active ? (
        <MessageBubble role="assistant" content={streaming.text}>
          {streaming.charts.map((c, i) => (
            <PlotlyChart key={i} chart={c} />
          ))}
          {streaming.toolStatus ? (
            <div className="mt-sm">
              <ToolStatus tool={streaming.toolStatus} />
            </div>
          ) : null}
          {!streaming.text && !streaming.toolStatus && streaming.charts.length === 0 ? (
            <div className="flex gap-xs py-xs">
              <span className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-pulse [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-pulse [animation-delay:300ms]" />
            </div>
          ) : null}
        </MessageBubble>
      ) : null}

      <div ref={endRef} />
    </section>
  );
}
