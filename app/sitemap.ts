import type { MetadataRoute } from "next";
import { TRUCK_MAKES, ALL_MODELS, truckMakeHref, truckModelHref } from "@/lib/trucks-data";
import { COMPARE_PAIRS, compareHref } from "@/lib/trucks-compare";
import { getGuideIndex } from "@/lib/guides";

const BASE = "https://agent.partsnow.ai";

// Guides are published daily after deploy time; on Vercel the ISR'd sitemap
// never revalidated (CDN kept serving the build-time copy), so serve it
// dynamically — it's one blob list + one small fetch per crawler request.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const guides = await getGuideIndex();
  return [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/trucks`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/guides`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...guides.map((g) => ({
      url: `${BASE}/guides/${g.slug}`,
      lastModified: new Date(g.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...TRUCK_MAKES.map((mk) => ({
      url: `${BASE}${truckMakeHref(mk.make)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...ALL_MODELS.map((m) => ({
      url: `${BASE}${truckModelHref(m.make, m.model)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...COMPARE_PAIRS.map((p) => ({
      url: `${BASE}${compareHref(p)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
