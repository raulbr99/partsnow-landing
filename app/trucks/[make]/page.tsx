import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, Calendar, ArrowRight, Factory } from "lucide-react";
import {
  TRUCK_MAKES, findMakeBySlug, modelsForMake, cleanMakeName, isLegacyMake,
  makeSlug, truckMakeHref, truckModelHref,
} from "@/lib/trucks-data";
import { modelImage } from "@/lib/trucks-images";
import { TruckSilhouette } from "@/components/trucks/TruckSilhouette";

const BASE = "https://agent.partsnow.ai";

type PageProps = { params: Promise<{ make: string }> };

export function generateStaticParams() {
  return TRUCK_MAKES.map((mk) => ({ make: makeSlug(mk.make) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { make } = await params;
  const mk = findMakeBySlug(make);
  if (!mk) return { title: "Truck make not found | PartsNow.ai" };
  const displayMake = cleanMakeName(mk.make);
  const title = `${displayMake} Trucks — Models, Specs & AI Diagnosis | PartsNow.ai`;
  const description = `${mk.blurb} Browse every ${displayMake} model, then let Mike — the free AI truck consultant — help you diagnose problems and find the right part.`;
  const canonical = `${BASE}${truckMakeHref(mk.make)}`;
  // First model photo of the make as the social card, when one exists.
  const photo = modelsForMake(mk.make).map((m) => modelImage(m.id)).find(Boolean);
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

export default async function TruckMakePage({ params }: PageProps) {
  const { make } = await params;
  const mk = findMakeBySlug(make);
  if (!mk) notFound();

  const displayMake = cleanMakeName(mk.make);
  const legacy = isLegacyMake(mk.make);
  const models = modelsForMake(mk.make);
  const canonical = `${BASE}${truckMakeHref(mk.make)}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Trucks", item: `${BASE}/trucks` },
      { "@type": "ListItem", position: 3, name: displayMake, item: canonical },
    ],
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${displayMake} truck models`,
    numberOfItems: models.length,
    itemListElement: models.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Vehicle",
        name: `${displayMake} ${m.model}`,
        url: `${BASE}${truckModelHref(m.make, m.model)}`,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      {/* Header band */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${mk.color} 0%, ${mk.color2} 100%)` }}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm text-white/70 mb-5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/trucks" className="hover:text-white transition-colors">Trucks</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">{displayMake}</span>
          </nav>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{displayMake}</h1>
            {legacy && (
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/30 text-white border border-white/25">Legacy · parts only</span>
            )}
          </div>
          <p className="text-white/85 text-base mt-3 max-w-2xl text-pretty">{mk.blurb}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4 text-sm text-white/75">
            <span className="inline-flex items-center gap-1.5"><Factory className="w-4 h-4" /> {mk.parent}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {mk.hq}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Est. {mk.founded}</span>
            <span className="font-semibold text-white">{models.length} models</span>
          </div>
        </div>
      </section>

      {/* Models grid */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {models.map((m) => {
            const photo = modelImage(m.id);
            const grad = `linear-gradient(135deg, ${m.makeColor} 0%, ${m.makeColor2} 100%)`;
            const classLabel = m.classes.length > 1 ? `Class ${m.classes[0]}–${m.classes[m.classes.length - 1]}` : `Class ${m.classes[0]}`;
            return (
              <div key={m.id} className="group relative rounded-2xl overflow-hidden border border-border/40 bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <Link href={truckModelHref(m.make, m.model)} className="flex flex-col flex-1">
                <div className="relative h-32 px-5 pt-4 overflow-hidden" style={{ background: grad }}>
                  {photo ? (
                    <>
                      <Image src={photo} alt={`${displayMake} ${m.model}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(102deg, ${m.makeColor} 0%, ${m.makeColor}d9 34%, ${m.makeColor}00 74%)` }} />
                    </>
                  ) : (
                    <TruckSilhouette bodyType={m.bodyType} className="absolute -bottom-1 right-1 w-48 h-24 text-white/40 group-hover:text-white/60 transition-all duration-500 origin-bottom-right" />
                  )}
                  <div className="relative flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/25">{classLabel}</span>
                  </div>
                  <h2 className="relative text-2xl font-extrabold text-white mt-0.5 drop-shadow-sm">{m.model}</h2>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-sm text-foreground/80 leading-snug line-clamp-2 min-h-[2.5rem]">{m.tagline}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] text-muted">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-light">{m.bodyType}</span>
                    <span className="px-2 py-0.5 rounded-md bg-neutral-light">{m.hp}</span>
                    <span className="px-2 py-0.5 rounded-md bg-neutral-light">{m.years.split("(")[0].trim()}</span>
                  </div>
                  <span className="mt-3 text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">Specs & diagnosis <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
