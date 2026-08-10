import Link from "next/link";
import Image from "next/image";
import {
  Wrench, Gauge, Cpu, MapPin, Layers, Sparkles, Factory, Calendar, Truck,
} from "lucide-react";
import {
  type FlatModel, partsHref, cleanMakeName, isLegacyMake, truckMakeHref,
} from "@/lib/trucks-data";
import { modelImage } from "@/lib/trucks-images";
import { partsForTruck } from "@/lib/trucks-parts";
import { TruckSilhouette } from "./TruckSilhouette";
import { AskMikeButton } from "./AskMikeButton";

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-muted text-[11px] font-semibold uppercase tracking-wider">{icon}{label}</div>
      <div className="text-sm text-foreground mt-0.5">{value}</div>
    </div>
  );
}

/** Full, server-rendered detail for a single truck model (the SEO page body). */
export default function ModelDetail({ model }: { model: FlatModel }) {
  const grad = `linear-gradient(135deg, ${model.makeColor} 0%, ${model.makeColor2} 100%)`;
  const photo = modelImage(model.id);
  const displayMake = cleanMakeName(model.make);
  const legacy = isLegacyMake(model.make);

  const classLabel = model.classes.length > 1
    ? `Class ${model.classes[0]}–${model.classes[model.classes.length - 1]}`
    : `Class ${model.classes[0]}`;

  const groups = partsForTruck(model);
  const showcase = groups.map((g) => g.products[0]).filter(Boolean).slice(0, 8);
  const cats = Array.from(new Set(groups.map((g) => g.category)));

  // Symptom seeds for the diagnosis block — each opens Mike with the truck named.
  const symptoms = [
    "it's making a strange noise",
    "a warning light just came on",
    "the brakes don't feel right",
    "it's leaking and I'm not sure from where",
  ];

  return (
    <article className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
      {/* Hero */}
      <div className="relative px-6 sm:px-8 pt-8 pb-10 overflow-hidden min-h-[180px]" style={{ background: grad }}>
        {photo ? (
          <>
            <Image src={photo} alt={`${displayMake} ${model.model}`} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(102deg, ${model.makeColor} 0%, ${model.makeColor}d9 40%, ${model.makeColor}26 80%), linear-gradient(to top, rgba(0,0,0,0.5), transparent 58%)` }} />
          </>
        ) : (
          <TruckSilhouette bodyType={model.bodyType} className="absolute -bottom-2 right-2 w-72 h-32 text-white/30" />
        )}
        <div className="relative flex flex-wrap items-center gap-2">
          <Link href={truckMakeHref(model.make)} className="text-xs font-bold uppercase tracking-widest text-white/85 hover:text-white drop-shadow">{displayMake}</Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/25">{classLabel}</span>
          {legacy && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/30 text-white border border-white/25">Legacy · parts only</span>
          )}
        </div>
        <h1 className="relative text-4xl sm:text-5xl font-extrabold text-white mt-2 drop-shadow">{displayMake} {model.model}</h1>
        <p className="relative text-white/85 text-base mt-3 max-w-xl drop-shadow">{model.tagline}</p>
      </div>

      {/* Wow fact */}
      <div className="mx-6 sm:mx-8 -mt-5 relative z-10 rounded-xl bg-card border border-border shadow-md px-4 py-3 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-accent shrink-0 mt-1" />
        <p className="text-sm text-foreground/90 leading-relaxed text-pretty">{model.fact}</p>
      </div>

      {/* Spec grid */}
      <div className="px-6 sm:px-8 py-6 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
        <Spec icon={<Factory className="w-4 h-4" />} label="Maker" value={model.parent} />
        <Spec icon={<Calendar className="w-4 h-4" />} label="Years" value={model.years} />
        <Spec icon={<Truck className="w-4 h-4" />} label="Body" value={model.bodyType} />
        <Spec icon={<Layers className="w-4 h-4" />} label="Rating" value={model.rating} />
        <Spec icon={<Gauge className="w-4 h-4" />} label="Power" value={model.hp} />
        <Spec icon={<MapPin className="w-4 h-4" />} label="Applications" value={model.applications.join(", ")} />
        <div className="col-span-2 sm:col-span-3">
          <Spec icon={<Cpu className="w-4 h-4" />} label="Engines" value={
            <span className="flex flex-wrap gap-1.5 mt-1">
              {model.engines.map((e) => (
                <span key={e} className="text-xs font-medium px-2 py-1 rounded-md bg-primary/8 text-primary border border-primary/15">{e}</span>
              ))}
            </span>
          } />
        </div>
      </div>

      {/* Diagnosis with Mike — what this site is for */}
      <div className="mx-6 sm:mx-8 mb-6 rounded-xl border border-primary/25 bg-primary/5 px-4 py-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-accent" /> Trouble with your {model.model}?
        </h2>
        <p className="text-xs text-muted mt-1 mb-3">
          Describe the symptom and Mike — the free AI truck consultant — will help you figure out
          what&apos;s wrong, which part is involved, and whether it&apos;s safe to drive. Free, no account.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {symptoms.map((s) => (
            <AskMikeButton
              key={s}
              make={model.make}
              model={model.model}
              label={s}
              message={`I've got a ${displayMake} ${model.model} and ${s}. Can you help me figure out what's going on?`}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-card border border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-1.5"
            />
          ))}
        </div>
      </div>

      {/* Common parts */}
      {groups.length > 0 && (
        <div className="px-6 sm:px-8 pb-6 border-t border-border/60 pt-5">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Wrench className="w-4 h-4 text-accent" /> Common replacement parts</h2>
          <p className="text-[11px] text-muted mt-1 mb-3">Real products from the PartsNow catalog. Confirm fitment with Mike before ordering.</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {showcase.map((p) => (
              <a key={p.handle} href={`https://partsnow.ai/products/${p.handle}`} target="_blank" rel="noopener" className="group/p rounded-lg border border-border/50 p-1.5 hover:border-primary/40 hover:shadow-sm transition-all">
                <div className="aspect-square bg-neutral-light rounded mb-1 overflow-hidden flex items-center justify-center">
                  {p.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.img} alt={p.title} loading="lazy" className="object-contain w-full h-full p-1 group-hover/p:scale-105 transition-transform" />
                  ) : <Wrench className="w-5 h-5 text-muted/40" />}
                </div>
                <p className="text-[9px] font-mono text-primary font-bold truncate">{p.sku}</p>
                <p className="text-[10px] text-foreground leading-tight line-clamp-2">{p.title}</p>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {cats.map((c) => (
              <a key={c} href={`https://partsnow.ai/products?type=${encodeURIComponent(c)}`} target="_blank" rel="noopener" className="text-[11px] font-medium px-2 py-1 rounded-md bg-neutral-light text-foreground hover:bg-primary/10 hover:text-primary transition-colors">{c}</a>
            ))}
          </div>
        </div>
      )}

      {/* CTAs — Ask Mike primary; Find parts + Call secondary outline */}
      <div className="px-6 sm:px-8 pb-7 pt-5 flex flex-col sm:flex-row gap-3 border-t border-border/60">
        <AskMikeButton
          make={model.make}
          model={model.model}
          label="Ask Mike about this truck"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors"
        />
        <a
          href={partsHref(model.make, model.model)}
          target="_blank"
          rel="noopener"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground hover:border-primary/50 hover:text-primary text-sm font-bold px-5 py-3 rounded-xl transition-colors"
        >
          <Wrench className="w-4 h-4" /> Find parts at PartsNow.ai
        </a>
        <a
          href="tel:+18652905485"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground hover:border-primary/50 hover:text-primary text-sm font-bold px-5 py-3 rounded-xl transition-colors"
        >
          Call or text (865) 290-5485
        </a>
      </div>
    </article>
  );
}
