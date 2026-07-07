import { useCallback, useRef, useState } from "react";
import { parseSSE } from "@/lib/sse";
import { ApiError } from "@/lib/apiError";
import { createSession, streamMessage } from "@/api/sessions";
import type { Chart, Message, SseEvent } from "@/types/api";

interface UseChatStreamArgs {
  /** Active session id, or undefined for a not-yet-created new chat. */
  sessionId: string | undefined;
  /** Called with the new id right after deferred creation (navigate + set active). */
  onSessionCreated: (id: string) => void;
  /** Append the optimistic user message to the view. */
  onUserMessage: (msg: Message) => void;
  /** Append the finalized assistant message once the turn completes. */
  onAssistantMessage: (msg: Message) => void;
  /** After `done`: refresh sidebar + credits (invalidate ['chats'], refetch ['me']). */
  onDone: (sessionId: string) => void;
  /** An in-stream `error` frame or a pre-stream ApiError (surface via toast/banner). */
  onError: (err: ApiError) => void;
}

interface UseChatStreamResult {
  isStreaming: boolean;
  streamingText: string;
  streamingCharts: Chart[];
  toolStatus: string | null;
  /** Send a turn. No-op if already streaming or content is empty. */
  send: (content: string, attachedCvId: string | null) => Promise<void>;
}

function narrow(frame: { event: string; data: string }): SseEvent | null {
  let data: unknown;
  try {
    data = JSON.parse(frame.data);
  } catch {
    return null;
  }
  switch (frame.event) {
    case "text":
    case "status":
    case "chart":
    case "error":
    case "done":
      return { event: frame.event, data } as SseEvent;
    default:
      return null;
  }
}

/**
 * Owns a single streaming turn: deferred session creation, opening the SSE
 * POST, consuming parseSSE, dispatching frames, and finalizing on `done`.
 * Blocks concurrent sends while streaming (Constitution Principle II).
 */
export function useChatStream(args: UseChatStreamArgs): UseChatStreamResult {
  const { sessionId, onSessionCreated, onUserMessage, onAssistantMessage, onDone, onError } = args;

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamingCharts, setStreamingCharts] = useState<Chart[]>([]);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const streamingRef = useRef(false);

  const send = useCallback(
    async (content: string, attachedCvId: string | null) => {
      const trimmed = content.trim();
      if (streamingRef.current || trimmed.length === 0) return;

      streamingRef.current = true;
      setIsStreaming(true);
      setStreamingText("");
      setStreamingCharts([]);
      setToolStatus(null);

      onUserMessage({ role: "user", content: trimmed, charts: null });

      let textAcc = "";
      const chartsAcc: Chart[] = [];

      try {
        // Deferred creation: make the session on the first send.
        let sid = sessionId;
        if (!sid) {
          const created = await createSession();
          sid = created.session_id;
          onSessionCreated(sid);
        }

        const res = await streamMessage(sid, {
          content: trimmed,
          attached_cv_id: attachedCvId,
        });
        if (!res.body) throw new Error("Empty response stream");

        for await (const raw of parseSSE(res.body)) {
          const evt = narrow(raw);
          if (!evt) continue;

          switch (evt.event) {
            case "text":
              textAcc += evt.data.content;
              setStreamingText(textAcc);
              break;
            case "status":
              setToolStatus(evt.data.tool);
              break;
            case "chart":
              chartsAcc.push(evt.data);
              setStreamingCharts([...chartsAcc]);
              break;
            case "error":
              // In-stream error: surface but keep reading; stream still ends with `done`.
              onError(new ApiError({ ...evt.data, httpStatus: 0 }));
              break;
            case "done":
              onAssistantMessage({
                role: "assistant",
                content: textAcc,
                charts: chartsAcc.length > 0 ? chartsAcc : null,
              });
              onDone(sid);
              break;
          }
        }
      } catch (err) {
        // Pre-stream failure (403/429 etc.) — apiClient already fired global
        // side effects for forbidden/resources_exhausted; surface the rest.
        if (ApiError.is(err)) onError(err);
        else onError(new ApiError({ code: "internal_error", message: String(err), request_id: "-", details: null, httpStatus: 0 }));
      } finally {
        streamingRef.current = false;
        setIsStreaming(false);
        setToolStatus(null);
        setStreamingText("");
        setStreamingCharts([]);
      }
    },
    [sessionId, onSessionCreated, onUserMessage, onAssistantMessage, onDone, onError],
  );

  return { isStreaming, streamingText, streamingCharts, toolStatus, send };
}
