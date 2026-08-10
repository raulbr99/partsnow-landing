import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  type Guide, type BacklogTopic, type GuideIndexEntry,
  getGuideIndex, saveGuide, saveGuideImage, popBacklogTopic,
  slugify, madridHour, madridDate,
} from "@/lib/guides";
import { ALL_MODELS, cleanMakeName } from "@/lib/trucks-data";

// Guide generator. Driven by the "PartsNow daily guide publisher" cloud routine,
// which fires at 13:00 and 14:00 UTC on its schedule; the Madrid-hour guard below
// makes exactly one of those publish at 15:00 local time year-round (CEST/CET).
// Topic source, in priority order: an explicit topic POSTed by the routine
// (demand-driven pick) -> the next item in guides/backlog.json -> an LLM pick.
// Manual runs: ?secret=…&force=1 (force also skips the once-per-day guard).

export const maxDuration = 300;

const RAG_QUERY_URL = "https://rag.talkrev.ai/query";
const RAG_TENANT = "parts-now-knowledge";
const TEXT_MODEL = "anthropic/claude-sonnet-5";
const IMAGE_MODELS = ["google/gemini-3.1-flash-image", "google/gemini-2.5-flash-image"];

const CATEGORIES = [
  "Brakes & Wheel End", "Air System", "Electrical & Lighting", "Engine & Cooling",
  "Filtration & Maintenance", "Suspension & Steering", "Trailer & Coupling",
  "Aftertreatment & Emissions", "Seasonal & Roadside",
];

// Stored Vercel env values may carry a literal trailing "\n" — strip it.
function orKey(): string {
  return (process.env.OPENROUTER_API_KEY ?? "").replace(/\\n$/, "").trim();
}

async function openrouter(body: Record<string, unknown>): Promise<Response> {
  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${orKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://agent.partsnow.ai",
      "X-Title": "PartsNow Guides",
    },
    body: JSON.stringify(body),
  });
}

function parseJson<T>(raw: string): T {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

async function chatJson<T>(system: string, user: string, temperature: number): Promise<T> {
  const res = await openrouter({
    model: TEXT_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature,
    response_format: { type: "json_object" },
  });
  if (!res.ok) throw new Error(`OpenRouter text error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return parseJson<T>(data.choices?.[0]?.message?.content ?? "");
}

// Grounding chunks from the expert KB (same source Mike uses). Fail-open.
async function fetchKnowledge(query: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(RAG_QUERY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenant: RAG_TENANT, query: query.slice(0, 300), k: 6, initial_k: 40 }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return "";
    const data = await res.json();
    const chunks: string[] = (data.results || []).map((r: { text?: string }) => r.text || "").filter(Boolean);
    return chunks.join("\n---\n").slice(0, 6000);
  } catch {
    return "";
  }
}

interface TopicPick {
  title: string;
  category: string;
  angle: string;
  truck: { make: string; model: string } | null;
  rag_query: string;
  image_prompt: string;
}

interface Draft {
  title: string;
  description: string;
  intro: string;
  sections: { heading: string; body: string }[];
  faq: { q: string; a: string }[];
  cover_alt: string;
}

async function generateCover(slug: string, prompt: string): Promise<string | null> {
  for (const model of IMAGE_MODELS) {
    try {
      const res = await openrouter({
        model,
        messages: [{
          role: "user",
          content: `Photorealistic editorial photograph, wide 16:9 cinematic composition, natural light, no text or logos anywhere in the image. ${prompt}`,
        }],
        modalities: ["image", "text"],
      });
      if (!res.ok) continue;
      const data = await res.json();
      const url: string | undefined = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!url?.startsWith("data:image/")) continue;
      const [meta, b64] = url.split(",");
      const contentType = meta.slice(5, meta.indexOf(";"));
      return await saveGuideImage(slug, Buffer.from(b64, "base64"), contentType);
    } catch {
      // try next model
    }
  }
  return null;
}

// Let the LLM invent a fresh topic, avoiding recent titles. Fallback path when
// no explicit topic and no backlog item is available.
async function llmPickTopic(index: GuideIndexEntry[]): Promise<TopicPick> {
  const recentTitles = index.slice(0, 30).map((e) => `- ${e.title}`).join("\n") || "(none yet)";
  const modelSample = [...ALL_MODELS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 15)
    .map((m) => `${cleanMakeName(m.make)} ${m.model}`)
    .join("; ");

  return chatJson<TopicPick>(
    `You plan daily guides for PartsNow.ai, a US heavy-duty truck & trailer parts platform in Knoxville, TN. Readers are owner-operators, fleet mechanics and shop managers. Guides are practical: diagnosing symptoms, maintenance how-tos, part-selection advice, seasonal prep, DOT-inspection prep. Respond ONLY with JSON.`,
    `Recent guide titles (do NOT repeat these topics):\n${recentTitles}\n\nCategories to choose from: ${CATEGORIES.join(", ")}.\nTruck models you may optionally anchor the guide to (only if it genuinely fits): ${modelSample}.\n\nPick ONE new guide topic a trucker would actually search for. Return JSON: {"title": "search-friendly title, max 70 chars", "category": "one of the categories", "angle": "2-sentence brief of what the guide covers and for whom", "truck": {"make": "...", "model": "..."} or null, "rag_query": "short query to pull relevant field-manual knowledge", "image_prompt": "one sentence describing a photorealistic hero image for this guide (a truck/workshop scene, no people close-ups)"}`,
    0.9,
  );
}

// Turn a seeded backlog/POST topic into a full TopicPick, filling any gaps.
function normalizeTopic(t: BacklogTopic): TopicPick {
  return {
    title: t.title.trim(),
    category: t.category && CATEGORIES.includes(t.category) ? t.category : "Filtration & Maintenance",
    angle: t.angle?.trim() || `A practical guide on "${t.title.trim()}" for owner-operators and fleet mechanics.`,
    truck: t.truck ?? null,
    rag_query: t.rag_query?.trim() || t.title.trim(),
    image_prompt: t.image_prompt?.trim() || `${t.title.trim()} — a heavy-duty truck or workshop scene.`,
  };
}

// Topic source priority: explicit override (routine) -> backlog -> LLM pick.
async function resolveTopic(index: GuideIndexEntry[], override: BacklogTopic | null): Promise<{ topic: TopicPick; source: string }> {
  if (override?.title) return { topic: normalizeTopic(override), source: "override" };
  const backlog = await popBacklogTopic();
  if (backlog) return { topic: normalizeTopic(backlog), source: "backlog" };
  return { topic: await llmPickTopic(index), source: "llm" };
}

// Ground the topic on the expert KB, draft, image, persist. Throws on bad draft.
async function generateAndSave(index: GuideIndexEntry[], topic: TopicPick, now: Date): Promise<Guide> {
  const knowledge = await fetchKnowledge(topic.rag_query || topic.title);
  const draft = await chatJson<Draft>(
    `You write practical guides for PartsNow.ai read by US owner-operators and fleet mechanics. Voice: plain-spoken, experienced, no fluff — like a veteran shop foreman writing for colleagues. Use markdown in body fields (short paragraphs, **bold** for part names, - lists for steps). Never invent torque specs, part numbers or prices; say "per OEM spec" when exact values matter. Flag safety-critical work (brakes, steering, wheel-end) as needing a certified tech's sign-off. Respond ONLY with JSON.`,
    `Write the guide "${topic.title}" (${topic.category}). Brief: ${topic.angle}${topic.truck ? ` Anchor examples to the ${topic.truck.make} ${topic.truck.model} where natural.` : ""}\n${knowledge ? `\nKNOWLEDGE from real field guides and OEM manuals — ground the guide in this, don't quote verbatim:\n${knowledge}\n` : ""}\nReturn JSON: {"title": "final title, max 70 chars", "description": "meta description, max 155 chars, includes the main keyword", "intro": "2-3 paragraph markdown intro that hooks the symptom/problem", "sections": [4-6 items: {"heading": "h2 text", "body": "markdown, 100-200 words"}], "faq": [5 items: {"q": "question a trucker would actually search for", "a": "2-3 sentence plain answer"}], "cover_alt": "descriptive alt text for the hero image"}`,
    0.5,
  );

  let slug = slugify(draft.title || topic.title);
  if (index.some((e) => e.slug === slug)) slug = `${slug}-${madridDate(now).replace(/-/g, "")}`;

  const coverImage = await generateCover(slug, topic.image_prompt || draft.title);

  // Validate the truck reference against the dataset so links never 404.
  const truck = topic.truck
    ? ALL_MODELS.find(
        (m) =>
          cleanMakeName(m.make).toLowerCase() === topic.truck!.make.toLowerCase().trim() &&
          m.model.toLowerCase() === topic.truck!.model.toLowerCase().trim(),
      )
    : undefined;

  const guide: Guide = {
    slug,
    title: draft.title || topic.title,
    description: draft.description,
    category: CATEGORIES.includes(topic.category) ? topic.category : "Filtration & Maintenance",
    truck: truck ? { make: truck.make, model: truck.model } : null,
    coverImage,
    coverAlt: draft.cover_alt || draft.title,
    intro: draft.intro,
    sections: (draft.sections || []).filter((s) => s?.heading && s?.body),
    faq: (draft.faq || []).filter((f) => f?.q && f?.a),
    publishedAt: now.toISOString(),
  };
  if (!guide.title || !guide.intro || guide.sections.length < 2) {
    throw new Error("draft failed validation");
  }
  await saveGuide(guide);

  revalidatePath("/guides");
  revalidatePath(`/guides/${slug}`);
  revalidatePath("/sitemap.xml");
  return guide;
}

// Shared handler for GET (backlog/LLM) and POST (explicit topic from the routine).
async function handle(req: NextRequest, override: BacklogTopic | null): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = req.headers.get("authorization");
  const qsSecret = req.nextUrl.searchParams.get("secret");
  if (secret && auth !== `Bearer ${secret}` && qsSecret !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!orKey()) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
  }

  const force = req.nextUrl.searchParams.get("force") === "1";
  const now = new Date();

  // The routine fires at 13:00 and 14:00 UTC; only the one landing on 15:00 Madrid publishes.
  if (!force && madridHour(now) !== 15) {
    return NextResponse.json({ skipped: "not 15:00 Madrid" });
  }

  const index = await getGuideIndex(true);
  const today = madridDate(now);
  if (!force && index.some((e) => madridDate(new Date(e.publishedAt)) === today)) {
    return NextResponse.json({ skipped: "already published today" });
  }

  try {
    const { topic, source } = await resolveTopic(index, override);
    const guide = await generateAndSave(index, topic, now);
    return NextResponse.json({ published: guide.slug, title: guide.title, source, coverImage: Boolean(guide.coverImage) });
  } catch (error) {
    console.error("[generate-guide] failed:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handle(req, null);
}

// The daily routine POSTs a demand-driven topic: {topic: {title, category?, angle?,
// rag_query?, image_prompt?, truck?}}. Same guards as GET; falls back to backlog/LLM
// if the body is empty or unparseable.
export async function POST(req: NextRequest) {
  let override: BacklogTopic | null = null;
  try {
    const body = await req.json();
    const t = body?.topic ?? body;
    if (t?.title && typeof t.title === "string") {
      override = {
        title: t.title,
        category: t.category,
        angle: t.angle,
        rag_query: t.rag_query,
        image_prompt: t.image_prompt,
        truck: t.truck ?? null,
      };
    }
  } catch {
    // no/invalid body — fall through to backlog/LLM
  }
  return handle(req, override);
}
