import { describe, it, expect } from "vitest";
import { parseSSE } from "@/lib/sse";
import type { RawSseFrame } from "@/types/api";

/** Build a ReadableStream<Uint8Array> from a list of string chunks. */
function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i < chunks.length) {
        controller.enqueue(encoder.encode(chunks[i]!));
        i += 1;
      } else {
        controller.close();
      }
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<RawSseFrame[]> {
  const out: RawSseFrame[] = [];
  for await (const frame of parseSSE(stream)) out.push(frame);
  return out;
}

describe("parseSSE", () => {
  it("parses a single well-formed frame", async () => {
    const frames = await collect(
      streamFromChunks(['event: text\ndata: {"content":"hi"}\n\n']),
    );
    expect(frames).toEqual([{ event: "text", data: '{"content":"hi"}' }]);
  });

  it("parses multiple frames delivered in one chunk", async () => {
    const frames = await collect(
      streamFromChunks([
        'event: text\ndata: {"content":"a"}\n\n' + 'event: done\ndata: {"message_id":"m1"}\n\n',
      ]),
    );
    expect(frames.map((f) => f.event)).toEqual(["text", "done"]);
    expect(frames[1]!.data).toBe('{"message_id":"m1"}');
  });

  it("reassembles a frame split across chunk boundaries", async () => {
    // The blank-line terminator is split across two chunks, and the data line too.
    const frames = await collect(
      streamFromChunks(["event: text\nda", 'ta: {"content":"sp', 'lit"}\n', "\n"]),
    );
    expect(frames).toEqual([{ event: "text", data: '{"content":"split"}' }]);
  });

  it("joins multi-line data with newlines (SSE spec)", async () => {
    const frames = await collect(streamFromChunks(["event: text\ndata: line1\ndata: line2\n\n"]));
    expect(frames).toEqual([{ event: "text", data: "line1\nline2" }]);
  });

  it("ignores comment / keep-alive lines", async () => {
    const frames = await collect(
      streamFromChunks([": keep-alive\n\n", 'event: status\ndata: {"tool":"sql_query"}\n\n']),
    );
    expect(frames).toEqual([{ event: "status", data: '{"tool":"sql_query"}' }]);
  });

  it("handles all five event types in order", async () => {
    const frames = await collect(
      streamFromChunks([
        'event: text\ndata: {"content":"x"}\n\n',
        'event: status\ndata: {"tool":"t"}\n\n',
        'event: chart\ndata: {"plotly_json":"{}","rtl":false}\n\n',
        'event: error\ndata: {"code":"internal_error","message":"m","request_id":"r","details":null}\n\n',
        'event: done\ndata: {"message_id":"m1"}\n\n',
      ]),
    );
    expect(frames.map((f) => f.event)).toEqual(["text", "status", "chart", "error", "done"]);
  });

  it("does not emit a trailing partial frame that never terminates", async () => {
    const frames = await collect(streamFromChunks(["event: text\ndata: partial-no-terminator"]));
    expect(frames).toEqual([]);
  });

  it("tolerates CRLF line endings", async () => {
    const frames = await collect(
      streamFromChunks(['event: done\r\ndata: {"message_id":"m1"}\r\n\r\n']),
    );
    expect(frames).toEqual([{ event: "done", data: '{"message_id":"m1"}' }]);
  });
});
