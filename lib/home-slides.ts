import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export const HOME_SLIDES_CACHE_TAG = "home-slides";

export interface AgentFeatureSlide {
  key: string;
  href: string;
  photo: string;
  showCall: boolean;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  bullets: string[];
}

export type AgentSlideRow = {
  id: string;
  href: string;
  photo: string;
  show_call: boolean;
  eyebrow_en: string;
  eyebrow_es: string;
  title_en: string;
  title_es: string;
  description_en: string;
  description_es: string;
  cta_en: string;
  cta_es: string;
  bullets_en: string[] | null;
  bullets_es: string[] | null;
};

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function fetchActiveAgentRows(): Promise<AgentSlideRow[]> {
  const sb = anonClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("home_slides")
    .select(
      "id, href, photo, show_call, eyebrow_en, eyebrow_es, title_en, title_es, description_en, description_es, cta_en, cta_es, bullets_en, bullets_es",
    )
    .eq("active", true)
    .eq("site", "agent")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[home-slides]", error.message);
    return [];
  }
  return (data as AgentSlideRow[]) ?? [];
}

export const getActiveAgentHomeSlides = unstable_cache(
  fetchActiveAgentRows,
  ["home-slides-active-agent"],
  { revalidate: 60, tags: [HOME_SLIDES_CACHE_TAG] },
);

export function mapAgentSlidesForLocale(
  rows: AgentSlideRow[],
  locale: "en" | "es",
): AgentFeatureSlide[] {
  const es = locale === "es";
  return rows.map((r) => ({
    key: r.id,
    href: r.href,
    photo: r.photo,
    showCall: r.show_call,
    eyebrow: es ? r.eyebrow_es : r.eyebrow_en,
    title: es ? r.title_es : r.title_en,
    description: es ? r.description_es : r.description_en,
    cta: es ? r.cta_es : r.cta_en,
    bullets: (es ? r.bullets_es : r.bullets_en) ?? [],
  }));
}

/** @deprecated Prefer passing rows + mapAgentSlidesForLocale client-side */
export function mapAgentSlides(rows: AgentSlideRow[]): AgentFeatureSlide[] {
  return mapAgentSlidesForLocale(rows, "en");
}
