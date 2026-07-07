import type { RawSseFrame } from "@/types/api";

/**
 * Parse a Server-Sent Events byte stream into frames.
 *
 * Isolated and dependency-free so it is unit-testable in isolation — the
 * highest-risk module per the constitution (Principle II). It does NOT know
 * about React, fetch, or the JobIT event shapes; it just yields
 * `{ event, data }` where `data` is the raw (still-JSON) string. The caller
 * (useChatStream) narrows `event` and JSON-parses `data`.
 *
 * Behavior:
 * - Decodes bytes with TextDecoder (streaming).
 * - Normalizes CRLF to LF, buffers, and splits complete frames on a blank line.
 * - Within a frame: reads the `event:` field and joins multiple `data:` lines
 *   with "\n" (per the SSE spec). Comment lines (starting ":") are ignored.
 * - A trailing partial frame with no terminating blank line is NOT emitted.
 */
export async function* parseSSE(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<RawSseFrame, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

      let sep: number;
      // A frame ends at the first blank line ("\n\n").
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const rawFrame = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const frame = parseFrame(rawFrame);
        if (frame) yield frame;
      }
    }
    // Flush any bytes still held by the decoder; a frame is only emitted if a
    // trailing terminator arrived (rare — servers end with a blank line).
    buffer += decoder.decode().replace(/\r\n/g, "\n");
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const rawFrame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const frame = parseFrame(rawFrame);
      if (frame) yield frame;
    }
  } finally {
    reader.releaseLock();
  }
}

/** Parse one frame block into `{ event, data }`, or null if it carries neither. */
function parseFrame(block: string): RawSseFrame | null {
  let event: string | null = null;
  const dataLines: string[] = [];

  for (const line of block.split("\n")) {
    if (line === "" || line.startsWith(":")) continue; // blank or comment
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1); // strip one leading space

    if (field === "event") event = value;
    else if (field === "data") dataLines.push(value);
    // other SSE fields (id, retry) are not used by this API
  }

  if (event === null && dataLines.length === 0) return null;
  return { event: event ?? "message", data: dataLines.join("\n") };
}
