export type SimliClientLike = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  sendAudioData: (data: Uint8Array) => void;
  ClearBuffer: () => void;
};

const SAMPLE_RATE = 16_000;
const BYTES_PER_SEC = SAMPLE_RATE * 2; // pcm_s16le mono @ 16 kHz
const FRAME_MS = 40;
const FRAME_BYTES = (BYTES_PER_SEC * FRAME_MS) / 1000; // 1280
/** Buffer a little audio before playback to avoid underruns / lip-sync hitches. */
const PREBUFFER_MS = 400;
const PREBUFFER_BYTES = (BYTES_PER_SEC * PREBUFFER_MS) / 1000;
const MAX_LAG_MS = FRAME_MS * 4;

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((r) => setTimeout(r, ms));
}

/** Append-only PCM buffer; avoids reallocating the whole stream on every chunk. */
class PcmAccumulator {
  private chunks: Uint8Array[] = [];
  private len = 0;

  append(chunk: Uint8Array) {
    if (!chunk.byteLength) return;
    this.chunks.push(chunk);
    this.len += chunk.byteLength;
  }

  byteLength() {
    return this.len;
  }

  take(n: number): Uint8Array | null {
    if (this.len < n) return null;
    const out = new Uint8Array(n);
    let written = 0;
    while (written < n && this.chunks.length) {
      const head = this.chunks[0];
      const need = n - written;
      if (head.length <= need) {
        out.set(head, written);
        written += head.length;
        this.chunks.shift();
      } else {
        out.set(head.subarray(0, need), written);
        this.chunks[0] = head.subarray(need);
        written += need;
      }
    }
    this.len -= n;
    return out;
  }

  takeRemainderEven(): Uint8Array | null {
    const even = this.len & ~1;
    if (even <= 0) return null;
    return this.take(even);
  }
}

/** Stream PCM16 from /api/tts into Simli at steady realtime pace. */
export async function speakViaTts(
  client: SimliClientLike,
  text: string,
  language: string,
  shouldAbort?: () => boolean,
): Promise<void> {
  if (shouldAbort?.()) return;

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  if (!res.ok || !res.body) throw new Error("tts_failed");

  const reader = res.body.getReader();
  const pcm = new PcmAccumulator();
  let playbackStarted = false;
  let nextFrameAt = 0;

  const pace = async () => {
    const now = performance.now();
    let delay = nextFrameAt - now;
    if (delay < -MAX_LAG_MS) {
      // Fell behind (e.g. big TTS chunk) — reset clock instead of bursting frames.
      nextFrameAt = now;
      delay = 0;
    }
    if (delay > 0) await sleep(delay);
    nextFrameAt += FRAME_MS;
  };

  const startPlayback = () => {
    if (playbackStarted) return;
    playbackStarted = true;
    nextFrameAt = performance.now() + FRAME_MS;
  };

  const sendFrames = async () => {
    if (!playbackStarted && pcm.byteLength() < PREBUFFER_BYTES) return;

    if (!playbackStarted) startPlayback();

    for (;;) {
      if (shouldAbort?.()) return;
      const frame = pcm.take(FRAME_BYTES);
      if (!frame) break;
      await pace();
      if (shouldAbort?.()) return;
      client.sendAudioData(frame);
    }
  };

  try {
    for (;;) {
      if (shouldAbort?.()) return;
      const { done, value } = await reader.read();
      if (done) break;
      if (value?.byteLength) pcm.append(value);
      await sendFrames();
    }

    if (shouldAbort?.()) return;

    if (!playbackStarted && pcm.byteLength() > 0) startPlayback();
    await sendFrames();

    const tail = pcm.takeRemainderEven();
    if (tail) {
      if (playbackStarted) await pace();
      if (!shouldAbort?.()) client.sendAudioData(tail);
    }
  } finally {
    void reader.cancel().catch(() => undefined);
  }
}

export async function loadSimliClient(): Promise<{
  SimliClient: new (
    sessionToken: string,
    video: HTMLVideoElement,
    audio: HTMLAudioElement,
    iceServers: null,
    logLevel: unknown,
    backend: string,
  ) => SimliClientLike;
  LogLevel: { INFO: unknown };
}> {
  // Lowercase entry — barrel breaks on Linux/Vercel (Client vs client.js).
  return import("simli-client/dist/client.js") as Promise<{
    SimliClient: new (
      sessionToken: string,
      video: HTMLVideoElement,
      audio: HTMLAudioElement,
      iceServers: null,
      logLevel: unknown,
      backend: string,
    ) => SimliClientLike;
    LogLevel: { INFO: unknown };
  }>;
}

export function stripForSpeech(text: string): string {
  return text.replace(/\*\*/g, "").trim().slice(0, 2000);
}
