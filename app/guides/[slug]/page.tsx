import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Wrench } from "lucide-react";
import { marked } from "marked";
import { getGuide, getGuideIndex, HOWTO_CATEGORY, type Guide } from "@/lib/guides";
import { truckModelHref, cleanMakeName, partsHref } from "@/lib/trucks-data";
import { PART_GROUPS, type CommonPart } from "@/lib/trucks-parts";
import { AskMikeButton } from "@/components/trucks/AskMikeButton";

// Guide categories -> catalog part-group categories (real products in stock).
const PARTS_BY_GUIDE_CATEGORY: Record<string, string[]> = {
  "Brakes & Wheel End": ["Brakes & Wheel End"],
  "Air System": ["Air System"],
  "Electrical & Lighting": ["Electrical & Lighting"],
  "Engine & Cooling": ["Cooling System", "Filtration"],
  "Filtration & Maintenance": ["Filtration"],
  "Suspension & Steering": ["Suspension & Steering"],
  "Trailer & Coupling": ["Body & Cab", "Brakes & Wheel End"],
  "Aftertreatment & Emissions": ["Exhaust", "Filtration"],
  "Seasonal & Roadside": ["Electrical & Lighting", "Air System"],
};

const PART_STOPWORDS = new Set([
  "the", "for", "and", "how", "your", "you", "with", "guide", "truck", "trucks",
  "parts", "part", "when", "what", "why", "best", "top", "fix", "fixes", "fixing",
  "symptoms", "signs", "checklist", "vs", "diagnosis", "replacement", "replace",
  "common", "class", "heavy", "duty", "semi", "step",
]);

// Products from this guide's catalog categories, ranked by how well each matches
// the guide's title keywords — so a DPF guide surfaces DPF parts, not just the
// first product in the category. Falls back to one-per-group so it never regresses
// to empty, and this ranking upgrades every existing guide at render time.
function partsForGuide(guide: Guide): CommonPart[] {
  const cats = PARTS_BY_GUIDE_CATEGORY[guide.category];
  if (!cats) return [];
  const groups = PART_GROUPS.filter((g) => cats.includes(g.category));

  const seen = new Set<string>();
  const products = groups
    .flatMap((g) => g.products)
    .filter((p) => p && !seen.has(p.handle) && seen.add(p.handle));

  const terms = (guide.title.toLowerCase().match(/[a-z0-9]+/g) ?? [])
    .filter((w) => w.length > 2 && !PART_STOPWORDS.has(w));

  const hits = products
    .map((p) => {
      const hay = `${p.title} ${p.sku}`.toLowerCase();
      return { p, score: terms.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0) };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.p);

  // Blend topical hits first, then one representative per group as filler.
  const used = new Set<string>();
  const merged: CommonPart[] = [];
  for (const p of [...hits, ...groups.map((g) => g.products[0])]) {
    if (p && !used.has(p.handle)) {
      used.add(p.handle);
      merged.push(p);
    }
  }
  return merged.slice(0, 8);
}

const BASE = "https://agent.partsnow.ai";

// Guides are created after deploy time — render on demand and cache.
export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

function md(s: string): string {
  return marked.parse(s, { async: false }) as string;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return { title: "Guide not found | PartsNow.ai" };
  const canonical = `${BASE}/guides/${guide.slug}`;
  return {
    title: `${guide.title} | PartsNow Truck Guides`,
    description: guide.description,
    alternates: { canonical },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: canonical,
      type: "article",
      publishedTime: guide.publishedAt,
      ...(guide.coverImage ? { images: [{ url: guide.coverImage }] } : {}),
    },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  const canonical = `${BASE}/guides/${guide.slug}`;
  // Related by topic: same-category guides first (most relevant), then fill with
  // the most recent from other categories. Index is already newest-first.
  const others = (await getGuideIndex()).filter((g) => g.slug !== guide.slug);
  const related = [
    ...others.filter((g) => g.category === guide.category),
    ...others.filter((g) => g.category !== guide.category),
  ].slice(0, 3);

  // Product how-tos get HowTo schema (sections = steps); everything else is an Article.
  const stripMd = (s: string) => s.replace(/[*_`>#-]/g, "").replace(/\s+/g, " ").trim();
  const articleJsonLd = guide.category === HOWTO_CATEGORY
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: guide.title,
        description: guide.description,
        datePublished: guide.publishedAt,
        url: canonical,
        ...(guide.coverImage ? { image: guide.coverImage } : {}),
        step: guide.sections.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.heading,
          text: stripMd(s.body).slice(0, 500),
          ...(s.image ? { image: s.image } : {}),
        })),
      }
    : {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        datePublished: guide.publishedAt,
        dateModified: guide.publishedAt,
        url: canonical,
        ...(guide.coverImage ? { image: guide.coverImage } : {}),
        author: { "@type": "Organization", name: "PartsNow", url: "https://partsnow.ai" },
        publisher: {
          "@type": "Organization",
          name: "PartsNow",
          url: "https://partsnow.ai",
          logo: { "@type": "ImageObject", url: `${BASE}/PartsNow-Icon.png` },
        },
        articleSection: guide.category,
      };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE}/guides` },
      { "@type": "ListItem", position: 3, name: guide.title, item: canonical },
    ],
  };
  const faqJsonLd = guide.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  } : null;

  const published = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date(guide.publishedAt));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm text-muted mb-5">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/guides" className="hover:text-primary transition-colors">Guides</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium line-clamp-1">{guide.title}</span>
        </nav>

        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{guide.category}</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-4 text-balance">{guide.title}</h1>
        <p className="text-sm text-muted mt-3">{published} · PartsNow Guides</p>

        {guide.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={guide.coverImage} alt={guide.coverAlt} className="w-full aspect-video object-cover rounded-2xl border border-border/60 shadow-sm mt-6" />
        )}

        <div className="guide-prose mt-8" dangerouslySetInnerHTML={{ __html: md(guide.intro) }} />

        {guide.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{s.heading}</h2>
            <div className="guide-prose mt-3" dangerouslySetInnerHTML={{ __html: md(s.body) }} />
            {s.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.image} alt={s.imageAlt ?? s.heading} loading="lazy" className="w-full rounded-xl border border-border/60 shadow-sm mt-4" />
            )}
          </section>
        ))}

        {guide.faq.length > 0 && (
          <section className="mt-10 rounded-2xl border border-border/60 bg-neutral-light/60 px-5 py-5">
            <h2 className="text-lg font-extrabold text-foreground">Quick answers</h2>
            {guide.faq.map((f) => (
              <div key={f.q} className="mt-4">
                <h3 className="text-sm font-bold text-foreground">{f.q}</h3>
                <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </section>
        )}

        {/* Real catalog parts for this kind of job */}
        {guide.category !== HOWTO_CATEGORY && partsForGuide(guide).length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2"><Wrench className="w-5 h-5 text-accent" /> Parts for this job</h2>
            <p className="text-[11px] text-muted mt-1 mb-3">Real products from the PartsNow catalog. Confirm fitment with Mike before ordering.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {partsForGuide(guide).map((p) => (
                <a key={p.handle} href={`https://partsnow.ai/products/${p.handle}`} target="_blank" rel="noopener" className="group/p rounded-lg border border-border/50 p-2 hover:border-primary/40 hover:shadow-sm transition-all bg-card">
                  <div className="aspect-square bg-neutral-light rounded mb-1.5 overflow-hidden flex items-center justify-center">
                    {p.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.img} alt={p.title} loading="lazy" className="object-contain w-full h-full p-1 group-hover/p:scale-105 transition-transform" />
                    ) : <Wrench className="w-5 h-5 text-muted/40" />}
                  </div>
                  <p className="text-[9px] font-mono text-primary font-bold truncate">{p.sku}</p>
                  <p className="text-[10px] text-foreground leading-tight line-clamp-2">{p.title}</p>
                  <p className="text-xs font-bold text-foreground mt-1">${p.price.toFixed(2)}</p>
                </a>
              ))}
            </div>
            {guide.truck && (
              <p className="text-sm mt-3">
                <a href={partsHref(guide.truck.make, guide.truck.model)} target="_blank" rel="noopener" className="font-semibold text-accent hover:underline">
                  Shop all parts for the {cleanMakeName(guide.truck.make)} {guide.truck.model} →
                </a>
              </p>
            )}
          </section>
        )}

        {/* Ask Mike CTA */}
        <div className="mt-10 rounded-2xl border border-primary/25 bg-primary/5 px-6 py-6 text-center">
          <h2 className="text-lg font-extrabold text-foreground">Still not sure what&apos;s wrong?</h2>
          <p className="text-sm text-muted mt-2 max-w-md mx-auto">Mike — the free AI truck consultant — will walk through your exact symptoms and point you to the right part. No account, English or Spanish, 24/7.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-5">
            <AskMikeButton
              make={guide.truck?.make ?? ""}
              model={guide.truck?.model ?? ""}
              label="Chat with Mike about this"
              message={`I just read your guide "${guide.title}". I've got a related problem — can you help me figure it out?`}
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
            />
            <a href="tel:+18652905485" className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground hover:border-primary/50 hover:text-primary text-sm font-bold px-6 py-3 rounded-xl transition-colors">
              Call or text (865) 290-5485
            </a>
          </div>
        </div>

        {/* Related truck + guides */}
        {guide.truck && (
          <p className="mt-8 text-sm text-muted">
            Related truck:{" "}
            <Link href={truckModelHref(guide.truck.make, guide.truck.model)} className="font-semibold text-primary hover:underline inline-flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5" /> {cleanMakeName(guide.truck.make)} {guide.truck.model} — specs &amp; parts
            </Link>
          </p>
        )}

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-extrabold text-foreground mb-4">More guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/guides/${r.slug}`} className="rounded-xl border border-border/60 p-3 hover:border-primary/40 hover:shadow-sm transition-all bg-card">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{r.category}</div>
                  <h3 className="text-sm font-bold text-foreground mt-1 leading-snug">{r.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
