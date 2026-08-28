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

type Row = {
  id: string;
  href: string;
  photo: string;
  show_call: boolean;
  eyebrow_en: string;
  title_en: string;
  description_en: string;
  cta_en: string;
  bullets_en: string[] | null;
};

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function fetchActiveAgentRows(): Promise<Row[]> {
  const sb = anonClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("home_slides")
    .select("id, href, photo, show_call, eyebrow_en, title_en, description_en, cta_en, bullets_en")
    .eq("active", true)
    .eq("site", "agent")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[home-slides]", error.message);
    return [];
  }
  return (data as Row[]) ?? [];
}

export const getActiveAgentHomeSlides = unstable_cache(
  fetchActiveAgentRows,
  ["home-slides-active-agent"],
  { revalidate: 60, tags: [HOME_SLIDES_CACHE_TAG] },
);

export function mapAgentSlides(rows: Row[]): AgentFeatureSlide[] {
  return rows.map((r) => ({
    key: r.id,
    href: r.href,
    photo: r.photo,
    showCall: r.show_call,
    eyebrow: r.eyebrow_en,
    title: r.title_en,
    description: r.description_en,
    cta: r.cta_en,
    bullets: r.bullets_en ?? [],
  }));
}