import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const SIMLI_TOKEN_URL = "https://api.simli.ai/compose/token";
const SIMLI_SESSIONS_URL = "https://api.simli.ai/ratelimiter/sessions";

export async function POST(req: NextRequest) {
  const { allowed, retryAfter } = checkRateLimit(clientIp(req));
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  }

  const apiKey = process.env.SIMLI_API_KEY;
  const faceId = process.env.SIMLI_FACE_ID;
  if (!apiKey || !faceId) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const maxSessions = Number(process.env.SIMLI_MAX_SESSIONS ?? "3") || 3;

  try {
    const usageRes = await fetch(SIMLI_SESSIONS_URL, { headers: { "x-simli-api-key": apiKey } });
    if (usageRes.ok) {
      const usage = (await usageRes.json()) as { currentUsage?: number };
      if ((usage.currentUsage ?? 0) >= maxSessions) return NextResponse.json({ error: "busy" }, { status: 429 });
    }

    const tokenRes = await fetch(SIMLI_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-simli-api-key": apiKey },
      body: JSON.stringify({
        faceId,
        apiVersion: "v2",
        maxSessionLength: 120,
        maxIdleTime: 30,
        handleSilence: false,
        audioInputFormat: "pcm16",
      }),
    });

    if (!tokenRes.ok) return NextResponse.json({ error: "unavailable" }, { status: 502 });
    const data = (await tokenRes.json()) as { session_token?: string };
    if (!data.session_token) return NextResponse.json({ error: "unavailable" }, { status: 502 });
    return NextResponse.json({ session_token: data.session_token });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}