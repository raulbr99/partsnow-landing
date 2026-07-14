import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { getGuideIndex, HOWTO_CATEGORY, type GuideIndexEntry } from "@/lib/guides";

const BASE = "https://agent.partsnow.ai";

// New guides land in Blob storage daily — refresh the page shortly after.
export const revalidate = 600;

const TITLE = "Truck Repair & Maintenance Guides | PartsNow.ai";
const DESCRIPTION = "Practical guides for owner-operators and fleet mechanics: diagnosing symptoms, maintenance how-tos and part-selection advice for heavy-duty trucks and trailers. A new guide every day.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE}/guides` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE}/guides`,
    type: "website",
    // Image comes from app/guides/opengraph-image.tsx (file convention).
  },
};

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date(iso));
}

function GuideCard({ g, showDate = true }: { g: GuideIndexEntry; showDate?: boolean }) {
  return (
    <Link
      href={`/guides/${g.slug}`}
      className="group rounded-2xl overflow-hidden border border-border/40 bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-44 overflow-hidden bg-secondary">
        {g.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={g.coverImage} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #1c436c 0%, #357e8d 100%)" }} />
        )}
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-white border border-white/25 backdrop-blur">{g.category}</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-extrabold text-foreground leading-snug">{g.title}</h3>
        <p className="text-sm text-muted leading-snug mt-2 line-clamp-3">{g.description}</p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-[11px] text-muted">{showDate ? fmtDate(g.publishedAt) : "How-to"}</span>
          <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">Read <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </Link>
  );
}

export default async function GuidesPage() {
  const guides = await getGuideIndex();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${BASE}/guides#blog`,
    name: "PartsNow Truck Guides",
    description: DESCRIPTION,
    url: `${BASE}/guides`,
    publisher: { "@type": "Organization", name: "PartsNow", url: "https://partsnow.ai" },
    blogPost: guides.slice(0, 30).map((g) => ({
      "@type": "BlogPosting",
      headline: g.title,
      description: g.description,
      datePublished: g.publishedAt,
      url: `${BASE}/guides/${g.slug}`,
      ...(g.coverImage ? { image: g.coverImage } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary">
        <div className="max-w-5xl mx-auto px-4 py-14 md:py-18 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary-light bg-white/10 border border-white/15 px-3 py-1 rounded-full">
            <BookOpen className="w-3.5 h-3.5" /> Truck Guides
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-5 text-balance">Fix it right the first time.</h1>
          <p className="text-lg text-white/70 mt-4 max-w-2xl mx-auto text-pretty">Practical diagnosis and maintenance guides for heavy-duty trucks and trailers — written for the people who turn the wrenches. New guide every day.</p>
        </div>
      </section>

      {/* Grids: product how-tos first, then repair & maintenance */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        {guides.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted/40 mx-auto mb-3" />
            <p className="text-muted">First guide is on its way — check back soon, or ask Mike directly.</p>
          </div>
        ) : (
          <>
            {guides.some((g) => g.category === HOWTO_CATEGORY) && (
              <div className="mb-12">
                <h2 className="text-2xl font-extrabold text-foreground">Using PartsNow</h2>
                <p className="text-sm text-muted mt-1 mb-6">Step-by-step help for the website and the mobile app.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {guides.filter((g) => g.category === HOWTO_CATEGORY).map((g) => (
                    <GuideCard key={g.slug} g={g} showDate={false} />
                  ))}
                </div>
              </div>
            )}
            <h2 className="text-2xl font-extrabold text-foreground">Repair &amp; maintenance</h2>
            <p className="text-sm text-muted mt-1 mb-6">A new guide every day, grounded in real field manuals.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {guides.filter((g) => g.category !== HOWTO_CATEGORY).map((g) => (
                <GuideCard key={g.slug} g={g} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
