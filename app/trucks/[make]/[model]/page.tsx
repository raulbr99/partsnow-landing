import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, BookOpen, GitCompareArrows } from "lucide-react";
import ModelDetail from "@/components/trucks/ModelDetail";
import {
  ALL_MODELS, findModelBySlugs, modelsForMake, cleanMakeName,
  makeSlug, modelSlug, truckModelHref, truckMakeHref,
} from "@/lib/trucks-data";
import { modelImage } from "@/lib/trucks-images";
import { comparesForModel, compareHref } from "@/lib/trucks-compare";
import { getGuideIndex, type GuideIndexEntry } from "@/lib/guides";

const BASE = "https://agent.partsnow.ai";

// Refresh daily so newly published guides show up on their truck's page.
export const revalidate = 86400;

type PageProps = { params: Promise<{ make: string; model: string }> };

/** Guides for this truck: exact truck match first, then same make, then latest. */
function guidesForTruck(index: GuideIndexEntry[], make: string, model: string): GuideIndexEntry[] {
  const clean = cleanMakeName(make).toLowerCase();
  const exact = index.filter((g) => g.truck && cleanMakeName(g.truck.make).toLowerCase() === clean && g.truck.model.toLowerCase() === model.toLowerCase());
  const sameMake = index.filter((g) => g.truck && cleanMakeName(g.truck.make).toLowerCase() === clean && !exact.includes(g));
  const latest = index.filter((g) => g.category !== "Using PartsNow" && !exact.includes(g) && !sameMake.includes(g));
  return [...exact, ...sameMake, ...latest].slice(0, 3);
}

export function generateStaticParams() {
  return ALL_MODELS.map((m) => ({ make: makeSlug(m.make), model: modelSlug(m.model) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { make, model } = await params;
  const m = findModelBySlugs(make, model);
  if (!m) return { title: "Truck not found | PartsNow.ai" };
  const displayMake = cleanMakeName(m.make);
  const title = `${displayMake} ${m.model} — Specs, Common Problems & Parts Help | Ask Mike`;
  const description = `${m.tagline} ${m.years} · ${m.bodyType} · ${m.hp}. Got trouble with your ${displayMake} ${m.model}? Mike, the free AI truck consultant, helps you diagnose it and find the right part — chat, call, or text.`;
  const canonical = `${BASE}${truckModelHref(m.make, m.model)}`;
  const photo = modelImage(m.id);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      ...(photo ? { images: [{ url: `${BASE}${photo}` }] } : {}),
    },
  };
}

export default async function TruckModelPage({ params }: PageProps) {
  const { make, model } = await params;
  const m = findModelBySlugs(make, model);
  if (!m) notFound();

  const displayMake = cleanMakeName(m.make);
  const canonical = `${BASE}${truckModelHref(m.make, m.model)}`;
  const photo = modelImage(m.id);
  const related = modelsForMake(m.make).filter((x) => x.id !== m.id);
  const compares = comparesForModel(m.id);
  const guides = guidesForTruck(await getGuideIndex(), m.make, m.model);

  const vehicleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${displayMake} ${m.model}`,
    brand: { "@type": "Brand", name: displayMake },
    model: m.model,
    vehicleConfiguration: m.bodyType,
    description: m.fact,
    manufacturer: { "@type": "Organization", name: m.parent },
    url: canonical,
    ...(photo ? { image: `${BASE}${photo}` } : {}),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Trucks", item: `${BASE}/trucks` },
      { "@type": "ListItem", position: 3, name: displayMake, item: `${BASE}${truckMakeHref(m.make)}` },
      { "@type": "ListItem", position: 4, name: m.model, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm text-muted mb-5">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/trucks" className="hover:text-primary transition-colors">Trucks</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={truckMakeHref(m.make)} className="hover:text-primary transition-colors">{displayMake}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{m.model}</span>
        </nav>

        <ModelDetail model={m} />

        {/* Compare with rivals */}
        {compares.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2"><GitCompareArrows className="w-5 h-5 text-primary" /> Compare the {m.model}</h2>
            <div className="flex flex-wrap gap-2">
              {compares.map((c) => (
                <Link key={c.slug} href={compareHref(c)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-light text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                  {c.a.model} vs {c.b.model}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Guides from the shop */}
        {guides.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Guides from the shop</h2>
              <Link href="/guides" className="text-sm font-semibold text-primary hover:underline">All guides →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {guides.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="rounded-xl border border-border/60 p-3 hover:border-primary/40 hover:shadow-sm transition-all bg-card">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{g.category}</div>
                  <h3 className="text-sm font-bold text-foreground mt-1 leading-snug">{g.title}</h3>
                  <div className="text-[11px] text-muted line-clamp-2 mt-1">{g.description}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related models from the same make */}
        {related.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-foreground">More {displayMake} models</h2>
              <Link href={truckMakeHref(m.make)} className="text-sm font-semibold text-primary hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={truckModelHref(r.make, r.model)}
                  className="rounded-xl border border-border/60 p-3 hover:border-primary/40 hover:shadow-sm transition-all bg-card"
                >
                  <div className="h-2 w-10 rounded-full mb-2" style={{ background: `linear-gradient(90deg, ${r.makeColor}, ${r.makeColor2})` }} />
                  <h3 className="text-sm font-bold text-foreground">{r.model}</h3>
                  <div className="text-[11px] text-muted line-clamp-1 mt-0.5">{r.tagline}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
