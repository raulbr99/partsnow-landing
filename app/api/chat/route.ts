import { NextRequest, NextResponse } from "next/server";

// Mike — diagnosis-only AI consultant for the landing page.
// Grounded on the PartsNow expert knowledge base (field diagnostic guides +
// OEM manuals in the `parts-now-knowledge` RAG tenant). Deliberately NO
// catalog access: no prices, no stock, no product search — for parts and
// ordering he refers to partsnow.ai or the phone line.

const RAG_QUERY_URL = "https://rag.talkrev.ai/query";
const RAG_TENANT = "parts-now-knowledge";

const SYSTEM_PROMPT = `You are Mike, the friendly AI truck-diagnosis consultant for PartsNow.ai, a heavy-duty truck and trailer parts platform based in Knoxville, TN. You help owner-operators, mechanics, and fleet managers figure out WHAT IS WRONG with their truck or trailer.

Personality: experienced, no-nonsense, warm, plain-spoken — like a veteran shop foreman. You speak fluent Freightliner, Peterbilt, Kenworth, Mack, Volvo, and International.

Your job is DIAGNOSIS ONLY:
- When someone describes a symptom, ask ONE or TWO short follow-up questions (truck make/model/year, engine, where the noise/leak/light is, when it happens) before naming a likely cause.
- Then explain what's most likely going on, which component is involved, how serious it is, and whether the truck is safe to drive.
- Suggest quick checks they can do themselves (look, listen, soap-water spray, gauge readings).
- If KNOWLEDGE context is provided below, ground your answer in it — it comes from real field diagnostic guides and OEM manuals. Don't quote it verbatim; speak like yourself.
- If the issue is safety-critical (brakes, steering, wheel-end), say so plainly and recommend a certified tech verifies the repair.

What you CANNOT do (hard limits — no exceptions):
- You have NO access to the catalog, stock or pricing systems. You CANNOT check, pull, or look up stock, prices or availability — not now, not after they give you more details. NEVER offer or promise to do so.
- If they ask about buying a part, a price, or availability, diagnosis-first answer if relevant, then your ONLY move for the purchase is: "For parts, pricing and stock, give us a call or text at (865) 290-5485 (English or Spanish) or order online at partsnow.ai."
- Never invent part numbers, prices, torque specs or wear limits. If a spec isn't in your knowledge, say it's per OEM spec.

Style:
- Keep replies SHORT — 2 to 4 sentences, conversational. No markdown headings or bullet lists.
- Respond in the same language the user writes in (English or Spanish).
- Never claim to be a real human — you're Mike, the AI consultant.`;

// Pull grounding chunks from the expert knowledge base. Fail-open: a slow or
// failed lookup must never block Mike from answering.
async function fetchKnowledge(query: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(RAG_QUERY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenant: RAG_TENANT, query: query.slice(0, 300), k: 4, initial_k: 30 }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return "";
    const data = await res.json();
    const chunks: string[] = (data.results || [])
      .map((r: { text?: string }) => r.text || "")
      .filter(Boolean);
    if (chunks.length === 0) return "";
    return chunks.join("\n---\n").slice(0, 3000);
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API not configured" }, { status: 500 });
    }

    // Ground the answer on the expert KB using the latest user message.
    const lastUser = [...messages].reverse().find((m: { role?: string }) => m.role === "user");
    const knowledge = lastUser?.content ? await fetchKnowledge(String(lastUser.content)) : "";

    const systemContent = knowledge
      ? `${SYSTEM_PROMPT}\n\nKNOWLEDGE (from PartsNow field guides and OEM manuals — use to ground your diagnosis):\n${knowledge}`
      : SYSTEM_PROMPT;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://agent.partsnow.ai",
        "X-Title": "PartsNow Mike",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.3-chat",
        messages: [
          { role: "system", content: systemContent },
          ...messages.slice(-10),
        ],
        temperature: 0.4,
        max_tokens: 300, // cost guard on a public page; replies are short by design
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't get a response. Try calling (865) 290-5485.";

    return NextResponse.json({ reply }, { headers: { "x-mike": "diagnosis-v2" } });
  } catch (error) {
    console.error("Mike chat error:", error);
    return NextResponse.json({ reply: "Something went wrong on my end. Call me at (865) 290-5485 and I'll help you out." });
  }
}
