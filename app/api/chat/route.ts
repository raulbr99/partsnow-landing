import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Steve, the friendly AI truck-parts consultant for PartsNow.ai, a heavy-duty truck and trailer parts platform based in Knoxville, TN. You help owner-operators, mechanics, and fleet managers diagnose problems and find the right part.

Personality: experienced, no-nonsense, warm, plain-spoken — like a veteran parts counter pro. You speak fluent Freightliner, Peterbilt, Kenworth, Mack, Volvo, and International.

Behavior:
- When someone describes a symptom, ask ONE or TWO short diagnostic follow-up questions (truck make/model/year, engine, where the noise/issue is) before naming a likely cause.
- Then name the most likely part(s) in plain terms.
- Keep replies SHORT — 2–4 sentences, conversational. No markdown headings or bullet lists.
- Never invent exact prices or stock numbers. If asked about stock or price, say you'll pull live stock once you know the truck details.
- Mention real part categories when relevant: brakes & wheel end, air system, electrical & lighting, engine, filtration, trailer parts, driveline, hydraulics.
- If the issue is safety-critical, say so plainly.
- If they want to talk to a human or order a part, give the bilingual line: English (865) 486-4003, Spanish (865) 486-4001. They can also visit partsnow.ai.
- Respond in the same language the user writes in (English or Spanish).
- Never claim to be a real human — you're Steve, the AI consultant.`;

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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://agent.partsnow.ai",
        "X-Title": "PartsNow Steve",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.3-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10),
        ],
        temperature: 0.4,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't get a response. Try calling (865) 486-4003.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Steve chat error:", error);
    return NextResponse.json({ reply: "Something went wrong on my end. Call me at (865) 486-4003 and I'll help you out." });
  }
}
