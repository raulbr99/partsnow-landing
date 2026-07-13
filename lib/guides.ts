import { list, put } from "@vercel/blob";

// Daily AI-generated guides. Content lives in Vercel Blob (same store as the
// demo video) so new posts appear without a redeploy: the cron route writes
// JSON + a cover image, and the /guides pages read them with ISR.

export interface GuideSection {
  heading: string;
  body: string; // markdown
  image?: string | null; // optional screenshot (public blob URL) shown after the body
  imageAlt?: string;
}

/** Category used by the hand-curated product how-to guides ("Using PartsNow").
 * The daily generator never picks it, and the index groups these separately. */
export const HOWTO_CATEGORY = "Using PartsNow";

export interface Guide {
  slug: string;
  title: string;
  description: string; // meta description, ~150 chars
  category: string;
  truck: { make: string; model: string } | null; // related encyclopedia model, if any
  coverImage: string | null; // public blob URL
  coverAlt: string;
  intro: string; // markdown
  sections: GuideSection[];
  faq: { q: string; a: string }[];
  publishedAt: string; // ISO
}

export interface GuideIndexEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  truck?: { make: string; model: string } | null; // related encyclopedia model
  coverImage: string | null;
  publishedAt: string;
  postUrl: string; // public blob URL of the full guide JSON
}

const INDEX_PATH = "guides/index.json";

/** All published guides, newest first. Empty on any storage error.
 * Pages must use the default (ISR-friendly) mode; only the always-dynamic
 * cron route may pass fresh=true (a no-store fetch inside a static page
 * flips it dynamic at runtime and 500s). */
export async function getGuideIndex(fresh = false): Promise<GuideIndexEntry[]> {
  try {
    const { blobs } = await list({ prefix: INDEX_PATH, limit: 1 });
    if (blobs.length === 0) return [];
    const res = await fetch(blobs[0].url, fresh ? { cache: "no-store" } : { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const entries = (await res.json()) as GuideIndexEntry[];
    return entries.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  } catch {
    return [];
  }
}

export async function getGuide(slug: string): Promise<Guide | null> {
  const index = await getGuideIndex();
  const entry = index.find((e) => e.slug === slug);
  if (!entry) return null;
  try {
    // Post JSONs are immutable (unique slug) — safe to cache long.
    const res = await fetch(entry.postUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as Guide;
  } catch {
    return null;
  }
}

/** Persist a guide (post JSON + refreshed index). Returns the post's blob URL. */
export async function saveGuide(guide: Guide): Promise<string> {
  const post = await put(`guides/posts/${guide.slug}.json`, JSON.stringify(guide), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  const index = await getGuideIndex(true);
  const entry: GuideIndexEntry = {
    slug: guide.slug,
    title: guide.title,
    description: guide.description,
    category: guide.category,
    truck: guide.truck,
    coverImage: guide.coverImage,
    publishedAt: guide.publishedAt,
    postUrl: post.url,
  };
  const next = [entry, ...index.filter((e) => e.slug !== guide.slug)];
  await put(INDEX_PATH, JSON.stringify(next), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    // The index is overwritten daily at the same URL — keep its edge cache short.
    cacheControlMaxAge: 60,
  });
  return post.url;
}

export async function saveGuideImage(slug: string, data: Buffer, contentType: string): Promise<string> {
  const ext = contentType.includes("png") ? "png" : "jpg";
  const blob = await put(`guides/images/${slug}.${ext}`, data, {
    access: "public",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob.url;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Hour of day (0-23) in Madrid for a given instant. */
export function madridHour(d: Date): number {
  return parseInt(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", hour12: false }).format(d),
    10,
  );
}

/** Calendar date (YYYY-MM-DD) in Madrid for a given instant. */
export function madridDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(d);
}
