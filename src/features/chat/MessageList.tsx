import { useEffect, useRef, useState } from "react";
import type { Chart, Message } from "@/types/api";
import { MessageBubble } from "@/features/chat/MessageBubble";
import { ToolStatus } from "@/features/chat/ToolStatus";
import { useLanguage } from "@/i18n/LanguageProvider";

interface StreamingState {
  active: boolean;
  text: string;
  charts: Chart[];
  toolStatus: string | null;
}

interface MessageListProps {
  messages: Message[];
  streaming: StreamingState;
  /**
   * Content of the assistant message that just finished — it types itself out
   * once. Other messages render fully. Null when nothing is being revealed.
   */
  revealContent: string | null;
  /** Called when the type-out animation finishes. */
  onRevealComplete: () => void;
}

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Types a completed answer out at a steady, constant pace. Because the full
 * text is known up front, the reveal is perfectly smooth (unlike chasing bursty
 * tokens). Long answers reveal faster (bounded total duration). Honors reduced
 * motion by showing everything at once, then reports completion.
 */
function RevealText({ text, onComplete }: { text: string; onComplete: () => void }) {
  const [count, setCount] = useState(() => (reducedMotion() ? text.length : 0));
  const rafRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!text || reducedMotion()) {
      setCount(text.length);
      onCompleteRef.current();
      return;
    }
    const duration = Math.min(20000, Math.max(1200, text.length * 55)); // ~18 chars/sec, capped
    const start = performance.now();
    let finished = false;
    setCount(0);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setCount(Math.round(text.length * p));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (!finished) {
        finished = true;
        onCompleteRef.current();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [text]);

  return <>{text.slice(0, count)}</>;
}

/** Assistant "thinking" bubble shown while the backend generates the answer. */
function ThinkingBubble({ toolStatus }: { toolStatus: string | null }) {
  return (
    <MessageBubble role="assistant" content="">
      {toolStatus ? (
        <ToolStatus tool={toolStatus} />
      ) : (
        <div className="flex gap-xs py-xs">
          <span className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-pulse [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-pulse [animation-delay:300ms]" />
        </div>
      )}
    </MessageBubble>
  );
}

/** Scrollable conversation: committed messages + the live "thinking" bubble. */
export function MessageList({
  messages,
  streaming,
  revealContent,
  onRevealComplete,
}: MessageListProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const { t } = useLanguage();

  // Follow the bottom as content grows — instantly, and only while the user is
  // already at the bottom (so scrolling up to read isn't interrupted).
  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;
    const pin = () => {
      if (stickRef.current) scroller.scrollTop = scroller.scrollHeight;
    };
    pin();
    const ro = new ResizeObserver(pin);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  const empty = messages.length === 0 && !streaming.active;
  const lastIndex = messages.length - 1;

  return (
    <section ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
      <div
        ref={contentRef}
        className="p-md flex flex-col gap-lg max-w-max-width-content mx-auto w-full min-h-full"
      >
        {empty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-on-primary shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <p className="font-title-sm text-title-sm">{t("chat.emptyTitle")}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              {t("chat.emptySubtitle")}
            </p>
          </div>
        ) : null}

        {messages.map((m, i) => {
          const revealing =
            i === lastIndex && m.role === "assistant" && m.content === revealContent;
          return (
            <MessageBubble
              key={i}
              role={m.role}
              content={
                revealing ? (
                  <RevealText text={m.content} onComplete={onRevealComplete} />
                ) : (
                  m.content
                )
              }
              charts={m.charts}
            />
          );
        })}

        {streaming.active ? <ThinkingBubble toolStatus={streaming.toolStatus} /> : null}
      </div>
    </section>
  );
}
