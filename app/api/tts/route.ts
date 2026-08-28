import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const CARTESIA_URL = "https://api.cartesia.ai/tts/bytes";
const MAX_TEXT_CHARS = 2000;
const DEFAULT_VOICE = "aec42b73-8c46-4528-a377-537b5ecb8e7b"; // Warren

export async function POST(req: NextRequest) {
  const { allowed, retryAfter } = checkRateLimit(clientIp(req));
  if (!allowed) {
    return new NextResponse("Too many requests.", { status: 429, headers: { "Retry-After": String(retryAfter) } });
  }

  const apiKey = process.env.CARTESIA_API_KEY;
  if (!apiKey) return new NextResponse("TTS not configured.", { status: 503 });

  let body: { text?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid JSON.", { status: 400 });
  }

  const text = body.text?.trim().slice(0, MAX_TEXT_CHARS);
  if (!text) return new NextResponse("Missing text.", { status: 400 });

  const voiceId = process.env.CARTESIA_VOICE_ID || DEFAULT_VOICE;
  const language = body.language || process.env.CARTESIA_LANGUAGE || "en";

  const upstream = await fetch(CARTESIA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "Cartesia-Version": "2024-06-10",
    },
    body: JSON.stringify({
      model_id: "sonic-2",
      transcript: text,
      voice: { mode: "id", id: voiceId },
      language,
      output_format: { container: "raw", encoding: "pcm_s16le", sample_rate: 16000 },
    }),
  });

  if (!upstream.ok || !upstream.body) return new NextResponse("TTS failed.", { status: 502 });

  return new NextResponse(upstream.body, {
    headers: { "Content-Type": "audio/pcm", "Cache-Control": "no-store" },
  });
}