import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Wrench, ArrowRight } from "lucide-react";
import { COMPARE_PAIRS, findComparePair, comparesForModel, compareHref } from "@/lib/trucks-compare";
import { type FlatModel, cleanMakeName, truckModelHref, partsHref } from "@/lib/trucks-data";
import { modelImage } from "@/lib/trucks-images";
import { TruckSilhouette } from "@/components/trucks/TruckSilhouette";
import { AskMikeButton } from "@/components/trucks/AskMikeButton";

const BASE = "https://agent.partsnow.ai";

type PageProps = { params: Promise<{ pair: string }> };

export function generateStaticParams() {
  return COMPARE_PAIRS.map((p) => ({ pair: p.slug }));
}

const name = (m: FlatModel) => `${cleanMakeName(m.make)} ${m.model}`;
const classLabel = (m: FlatModel) =>
  m.classes.length > 1 ? `Class ${m.classes[0]}–${m.classes[m.classes.length - 1]}` : `Class ${m.classes[0]}`;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pair } = await params;
  const p = findComparePair(pair);
  if (!p) return { title: "Comparison not found | PartsNow.ai" };
  const title = `${name(p.a)} vs ${name(p.b)} — Specs Compared | PartsNow.ai`;
  const description = `${name(p.a)} (${p.a.hp}, ${p.a.bodyType}) vs ${name(p.b)} (${p.b.hp}, ${p.b.bodyType}): engines, GVWR ratings, years and applications side by side — plus Mike, the free AI consultant, to help you pick and find parts for either.`;
  const canonical = `${BASE}/trucks/compare/${p.slug}`;
  const photo = modelImage(p.a.id) ?? modelImage(p.b.id);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical, type: "website",
      ...(photo ? { images: [{ url: `${BASE}${photo}` }] } : {}),
    },
  };
}

function PhotoCard({ m }: { m: FlatModel }) {
  const photo = modelImage(m.id);
  const grad = `linear-gradient(135deg, ${m.makeColor} 0%, ${m.makeColor2} 100%)`;
  return (
    <Link href={truckModelHref(m.make, m.model)} className="group relative rounded-2xl overflow-hidden border border-border/40 shadow-sm hover:shadow-xl transition-all block">
      <div className="relative h-44 px-5 pt-4 overflow-hidden" style={{ background: grad }}>
        {photo ? (
          <>
            <Image src={photo} alt={name(m)} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(102deg, ${m.makeColor} 0%, ${m.makeColor}d9 30%, ${m.makeColor}00 70%), linear-gradient(to top, rgba(0,0,0,0.4), transparent 55%)` }} />
          </>
        ) : (
          <TruckSilhouette bodyType={m.bodyType} className="absolute -bottom-1 right-1 w-52 h-24 text-white/45" />
        )}
        <div className="relative">
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/85 drop-shadow">{cleanMakeName(m.make)}</span>
          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/25">{classLabel(m)}</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5 drop-shadow-sm">{m.model}</h2>
          <p className="text-white/85 text-sm mt-1 drop-shadow max-w-xs">{m.tagline}</p>
        </div>
      </div>
    </Link>
  );
}

export default async function TruckComparePage({ params }: PageProps) {
  const { pair } = await params;
  const p = findComparePair(pair);
  if (!p) notFound();
  const { a, b } = p;

  const canonical = `${BASE}/trucks/compare/${p.slug}`;
  const rows: { label: string; get: (m: FlatModel) => string }[] = [
    { label: "Maker", get: (m) => m.parent },
    { label: "Class", get: (m) => classLabel(m) },
    { label: "Body type", get: (m) => m.bodyType },
    { label: "Years", get: (m) => m.years },
    { label: "Rating", get: (m) => m.rating },
    { label: "Power", get: (m) => m.hp },
    { label: "Engines", get: (m) => m.engines.join(", ") },
    { label: "Applications", get: (m) => m.applications.join(", ") },
  ];

  const related = [...comparesForModel(a.id), ...comparesForModel(b.id)]
    .filter((x) => x.slug !== p.slug)
    .filter((x, i, arr) => arr.findIndex((y) => y.slug === x.slug) === i)
    .slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${name(a)} vs ${name(b)}`,
    numberOfItems: 2,
    itemListElement: [a, b].map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Vehicle",
        name: name(m),
        brand: { "@type": "Brand", name: cleanMakeName(m.make) },
        model: m.model,
        vehicleConfiguration: m.bodyType,
        manufacturer: { "@type": "Organization", name: m.parent },
        url: `${BASE}${truckModelHref(m.make, m.model)}`,
        ...(modelImage(m.id) ? { image: `${BASE}${modelImage(m.id)}` } : {}),
      },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Trucks", item: `${BASE}/trucks` },
      { "@type": "ListItem", position: 3, name: `${name(a)} vs ${name(b)}`, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm text-muted mb-5">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/trucks" className="hover:text-primary transition-colors">Trucks</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{name(a)} vs {name(b)}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight text-balance">{name(a)} vs {name(b)}</h1>
        <p className="text-base text-muted mt-3 max-w-2xl">
          Two {a.bodyType === b.bodyType ? `${a.bodyType.toLowerCase()} rigs` : "trucks"} compared spec for spec: the {a.model} ({a.years}, {a.hp}) against the {b.model} ({b.years}, {b.hp}). Same data we keep on every truck in the <Link href="/trucks" className="text-primary font-semibold hover:underline">encyclopedia</Link> — and Mike on hand if the answer depends on your routes and loads.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <PhotoCard m={a} />
          <PhotoCard m={b} />
        </div>

        {/* Spec table */}
        <div className="mt-8 rounded-2xl border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[520px] text-sm">
              <thead>
                <tr className="bg-secondary text-white">
                  <th className="p-3 text-left w-32 font-bold text-[11px] uppercase tracking-wider text-white/70">Spec</th>
                  <th className="p-3 text-left font-extrabold">{name(a)}</th>
                  <th className="p-3 text-left font-extrabold">{name(b)}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.label} className={i % 2 ? "bg-neutral-light/50" : "bg-card"}>
                    <td className="p-3 text-[11px] font-bold uppercase tracking-wider text-muted align-top">{row.label}</td>
                    <td className="p-3 text-foreground align-top">{row.get(a)}</td>
                    <td className="p-3 text-foreground align-top">{row.get(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Background on each */}
        {[a, b].map((m) => (
          <section key={m.id} className="mt-8">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">About the {name(m)}</h2>
            <p className="text-sm text-foreground/85 leading-relaxed mt-2 text-pretty">{m.fact}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              <Link href={truckModelHref(m.make, m.model)} className="font-semibold text-primary hover:underline inline-flex items-center gap-1">Full specs & parts <ArrowRight className="w-3.5 h-3.5" /></Link>
              <a href={partsHref(m.make, m.model)} target="_blank" rel="noopener" className="font-semibold text-accent hover:underline inline-flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> Shop {m.model} parts</a>
            </div>
          </section>
        ))}

        {/* Ask Mike CTA */}
        <div className="mt-10 rounded-2xl border border-primary/25 bg-primary/5 px-6 py-6 text-center">
          <h2 className="text-lg font-extrabold text-foreground">Which one fits your operation?</h2>
          <p className="text-sm text-muted mt-2 max-w-md mx-auto">Specs only get you so far — routes, loads and the shop that maintains it matter. Mike, the free AI truck consultant, talks it through with you. No account, 24/7.</p>
          <div className="flex justify-center mt-5">
            <AskMikeButton
              make={a.make}
              model={a.model}
              label={`Ask Mike: ${a.model} or ${b.model}?`}
              message={`I'm weighing a ${name(a)} against a ${name(b)}. Can you help me think through which fits my operation better?`}
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
            />
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-extrabold text-foreground mb-3">More comparisons</h2>
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <Link key={r.slug} href={compareHref(r)} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-light text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                  {r.a.model} vs {r.b.model}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
