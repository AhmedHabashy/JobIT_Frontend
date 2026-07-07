import { useState } from "react";
import type { KeyboardEvent } from "react";

const MAX_LEN = 8000;

interface ComposerProps {
  disabled: boolean;
  /** Reason the composer is disabled beyond streaming (e.g. out of credits). */
  blockedReason?: string | null;
  onSend: (content: string) => void;
}

/**
 * Message composer. Enter sends, Shift+Enter inserts a newline. Send is disabled
 * while a turn is streaming (Principle II) or when blocked (e.g. out of credits).
 * The CV attachment control is added in US4.
 */
export function Composer({ disabled, blockedReason, onSend }: ComposerProps) {
  const [text, setText] = useState("");
  const canSend = !disabled && text.trim().length > 0 && text.length <= MAX_LEN;

  function submit() {
    if (!canSend) return;
    onSend(text);
    setText("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <footer className="p-md bg-surface border-t border-outline-variant">
      <div className="max-w-3xl mx-auto">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xs flex flex-col focus-within:border-primary transition-all">
          <textarea
            className="w-full border-none focus:ring-0 focus:outline-none font-body-md text-body-md resize-none p-sm bg-transparent placeholder:text-on-surface-variant/50"
            placeholder="Ask about career paths, labour laws, or salaries in Egypt…"
            rows={2}
            maxLength={MAX_LEN}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center justify-between px-sm pb-sm">
            <span className="font-label-caps text-[11px] text-on-surface-variant opacity-60">
              {text.length > MAX_LEN - 200 ? `${text.length}/${MAX_LEN}` : ""}
            </span>
            <button
              type="button"
              aria-label="Send message"
              disabled={!canSend}
              onClick={submit}
              className="bg-primary text-on-primary p-sm rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
        {blockedReason ? (
          <p className="text-[11px] text-center mt-sm text-error">{blockedReason}</p>
        ) : (
          <p className="text-[11px] text-center mt-sm text-on-surface-variant opacity-60">
            Jobit AI can provide guidance but does not replace legal advice.
          </p>
        )}
      </div>
    </footer>
  );
}
