import type { Metadata } from "next";
import Link from "next/link";
import TrucksExplorer from "@/components/trucks/TrucksExplorer";
import { TRUCK_MAKES, ALL_MODELS, TRUCK_STATS, truckModelHref, truckMakeHref, cleanMakeName } from "@/lib/trucks-data";
import { COMPARE_PAIRS, compareHref } from "@/lib/trucks-compare";

const BASE = "https://agent.partsnow.ai";

// Build-time year: keeps the page fully static (refreshed on every deploy).
const CURRENT_YEAR = new Date().getFullYear();

const TITLE = "US Truck Encyclopedia — Diagnose Any Make & Model with Mike | PartsNow.ai";
const DESCRIPTION = `Specs, engines and history for ${TRUCK_STATS.models}+ US commercial trucks (Class 3–8) from ${TRUCK_STATS.makes} makes — plus Mike, the free AI consultant who helps you diagnose problems and find the right part. Chat, call, or text.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE}/trucks` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE}/trucks`,
    type: "website",
    images: [{ url: `${BASE}/trucks-images/models/kenworth-w900.jpg` }],
  },
};

export default function TrucksPage() {
  // Structured data — an ItemList of every model, great for AI answer engines.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "US Commercial Truck Makes & Models",
    description: DESCRIPTION,
    numberOfItems: ALL_MODELS.length,
    itemListElement: ALL_MODELS.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Vehicle",
        name: `${m.make} ${m.model}`,
        brand: { "@type": "Brand", name: m.make },
        vehicleConfiguration: m.bodyType,
        url: `${BASE}${truckModelHref(m.make, m.model)}`,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Trucks", item: `${BASE}/trucks` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <TrucksExplorer currentYear={CURRENT_YEAR} />

      {/* Popular head-to-head comparisons */}
      <section className="max-w-7xl mx-auto px-4 pb-4">
        <h2 className="text-2xl font-extrabold text-foreground mb-2">Popular comparisons</h2>
        <p className="text-muted text-sm mb-4 max-w-2xl">The match-ups drivers argue about, settled with data — specs side by side, and Mike to talk through which fits your operation.</p>
        <div className="flex flex-wrap gap-2">
          {COMPARE_PAIRS.slice(0, 14).map((p) => (
            <Link key={p.slug} href={compareHref(p)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-light text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              {p.a.model} vs {p.b.model}
            </Link>
          ))}
        </div>
      </section>

      {/* SEO-friendly server-rendered directory (also a graceful no-JS fallback) */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border">
        <h2 className="text-2xl font-extrabold text-foreground mb-2">Every make, every model</h2>
        <p className="text-muted text-sm mb-8 max-w-2xl">Browse the full directory. Each truck has its own page with specs, engines, common replacement parts — and Mike on hand to help you diagnose whatever it&apos;s doing.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
          {TRUCK_MAKES.map((mk) => (
            <div key={mk.make}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full" style={{ background: mk.color }} />
                <a href={truckMakeHref(mk.make)} className="text-base font-bold text-foreground hover:text-primary transition-colors">{cleanMakeName(mk.make)}</a>
                <span className="text-xs text-muted">· {mk.hq}</span>
              </div>
              <p className="text-xs text-muted mb-3">{mk.blurb}</p>
              <ul className="flex flex-wrap gap-1.5">
                {mk.models.map((m) => (
                  <li key={m.model}>
                    <a
                      href={truckModelHref(mk.make, m.model)}
                      className="text-xs font-medium px-2 py-1 rounded-md bg-neutral-light text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {m.model}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-10">
          {TRUCK_STATS.makes} makes · {TRUCK_STATS.models}+ models · {TRUCK_STATS.engines} engines
          {" · "}
          <Link href="/trucks/credits" className="hover:text-primary transition-colors underline">Photos: Wikimedia Commons — credits</Link>
        </p>
      </section>
    </>
  );
}
