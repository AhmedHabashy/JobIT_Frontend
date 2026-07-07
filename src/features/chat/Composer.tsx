import { useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { ApiError } from "@/lib/apiError";
import { ALLOWED_CV_EXTENSIONS, useUploadCv, validateCvFile } from "@/api/upload";

const MAX_LEN = 8000;

interface ComposerProps {
  disabled: boolean;
  /** Reason the composer is disabled beyond streaming (e.g. out of credits). */
  blockedReason?: string | null;
  onSend: (content: string, attachedCvId: string | null) => void;
}

interface Attachment {
  file_id: string;
  filename: string;
}

/**
 * Message composer with CV attachment (US4). Enter sends, Shift+Enter newlines.
 * Send is blocked while streaming (Principle II) or when out of credits. A CV is
 * validated client-side (type/size) then uploaded; its file_id rides the next
 * message as attached_cv_id and is cleared after send.
 */
export function Composer({ disabled, blockedReason, onSend }: ComposerProps) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadCv();

  const busy = disabled || upload.isPending;
  const canSend = !busy && text.trim().length > 0 && text.length <= MAX_LEN;

  function submit() {
    if (!canSend) return;
    onSend(text, attachment?.file_id ?? null);
    setText("");
    setAttachment(null);
    setInlineError(null);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Allow re-selecting the same file later.
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    const validationError = validateCvFile(file);
    if (validationError) {
      setInlineError(validationError);
      return;
    }
    setInlineError(null);
    upload.mutate(file, {
      onSuccess: (res) => setAttachment({ file_id: res.file_id, filename: res.filename }),
      onError: (err) =>
        setInlineError(ApiError.is(err) ? err.message : "Upload failed. Please try again."),
    });
  }

  return (
    <footer className="p-md bg-surface border-t border-outline-variant">
      <div className="max-w-3xl mx-auto">
        {attachment ? (
          <div className="mb-sm flex items-center gap-xs w-fit bg-surface-container-lowest border border-outline-variant rounded-lg px-sm py-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">description</span>
            <span className="font-body-sm text-body-sm truncate max-w-[240px]" title={attachment.filename}>
              {attachment.filename}
            </span>
            <button
              type="button"
              aria-label="Remove attachment"
              onClick={() => setAttachment(null)}
              className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-error"
            >
              close
            </button>
          </div>
        ) : null}

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xs flex flex-col focus-within:border-primary transition-all">
          <textarea
            name="message"
            aria-label="Message"
            className="w-full border-none focus:ring-0 focus:outline-none font-body-md text-body-md resize-none p-sm bg-transparent placeholder:text-on-surface-variant/50"
            placeholder="Ask about career paths, labour laws, or salaries in Egypt…"
            rows={2}
            maxLength={MAX_LEN}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center justify-between px-sm pb-sm">
            <div className="flex items-center gap-base">
              <input
                ref={fileInputRef}
                type="file"
                name="cv"
                aria-label="CV file"
                accept={ALLOWED_CV_EXTENSIONS.join(",")}
                className="hidden"
                onChange={handleFile}
              />
              <button
                type="button"
                title="Attach CV (PDF/DOCX/DOC)"
                aria-label="Attach CV"
                disabled={upload.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="p-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined">
                  {upload.isPending ? "progress_activity" : "attach_file"}
                </span>
                <span className="text-label-caps font-label-caps hidden sm:inline">
                  {upload.isPending ? "Uploading…" : "PDF/DOCX"}
                </span>
              </button>
            </div>
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

        {inlineError ? (
          <p role="alert" className="text-[12px] mt-sm text-error">
            {inlineError}
          </p>
        ) : blockedReason ? (
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
