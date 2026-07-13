"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, X, Truck, Gauge, Wrench, ArrowRight, Plus, Check,
  Calendar, GitCompareArrows,
} from "lucide-react";
import {
  ALL_MODELS, MAKE_NAMES, BODY_TYPES, ALL_CLASSES, TRUCK_STATS,
  partsHref, truckModelHref, type FlatModel, type BodyType,
} from "@/lib/trucks-data";
import { modelImage } from "@/lib/trucks-images";
import { TruckSilhouette } from "./TruckSilhouette";

const MAX_COMPARE = 3;

// ---------- Animated count-up ----------
function useCountUp(target: number, durationMs = 1100) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !started.current) {
        started.current = true;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setValue(target); return; }
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / durationMs);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, durationMs]);
  return { value, ref };
}

function Stat({ target, label, suffix = "" }: { target: number; label: string; suffix?: string }) {
  const { value, ref } = useCountUp(target);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-extrabold text-white tabular-nums">
        {value.toLocaleString("en-US")}{suffix}
      </div>
      <div className="text-xs md:text-sm text-white/60 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function ClassBadge({ classes }: { classes: number[] }) {
  const label = classes.length > 1 ? `Class ${classes[0]}–${classes[classes.length - 1]}` : `Class ${classes[0]}`;
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/25">
      {label}
    </span>
  );
}

// ---------- Truck card ----------
const TruckCard = memo(function TruckCard({
  model, inCompare, onToggleCompare,
}: {
  model: FlatModel; inCompare: boolean; onToggleCompare: (id: string) => void;
}) {
  const grad = `linear-gradient(135deg, ${model.makeColor} 0%, ${model.makeColor2} 100%)`;
  const photo = modelImage(model.id);
  const href = truckModelHref(model.make, model.model);
  return (
    <div className="group relative rounded-2xl overflow-hidden border border-border/40 bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Compare toggle */}
      <button
        onClick={() => onToggleCompare(model.id)}
        aria-pressed={inCompare}
        className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur transition-all ${
          inCompare ? "bg-white text-foreground shadow-md" : "bg-black/25 text-white hover:bg-black/40"
        }`}
        title="Add to Spec Showdown"
      >
        {inCompare ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>

      {/* Brand banner */}
      <Link href={href} className="relative block w-full text-left h-36 px-5 pt-4 overflow-hidden" style={{ background: grad }}>
        {photo ? (
          <>
            <Image src={photo} alt={`${model.make} ${model.model}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(102deg, ${model.makeColor} 0%, ${model.makeColor}d9 32%, ${model.makeColor}00 74%), linear-gradient(to top, rgba(0,0,0,0.4), transparent 55%)` }} />
          </>
        ) : (
          <TruckSilhouette
            bodyType={model.bodyType}
            className="absolute -bottom-1 right-1 w-52 h-24 text-white/45 group-hover:text-white/65 group-hover:scale-105 transition-all duration-500 origin-bottom-right"
          />
        )}
        <div className="relative flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/85 drop-shadow">{model.make}</span>
          <ClassBadge classes={model.classes} />
        </div>
        <div className="relative text-2xl font-extrabold text-white mt-0.5 drop-shadow-sm">{model.model}</div>
      </Link>

      {/* Body */}
      <Link href={href} className="p-4 flex flex-col flex-1 text-left">
        <p className="text-sm text-foreground/80 leading-snug line-clamp-2 min-h-[2.5rem]">{model.tagline}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-light text-muted flex items-center gap-1">
            <Truck className="w-3 h-3" />{model.bodyType}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-light text-muted flex items-center gap-1">
            <Gauge className="w-3 h-3" />{model.hp}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-light text-muted flex items-center gap-1">
            <Calendar className="w-3 h-3" />{model.years.split("(")[0].trim()}
          </span>
        </div>
        <span className="mt-3 text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
          View specs & diagnosis <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </Link>
    </div>
  );
});

// ---------- Spec Showdown (compare) ----------
function CompareModal({ models, onClose, onRemove }: { models: FlatModel[]; onClose: () => void; onRemove: (id: string) => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // Minimal dialog behavior: focus on open, Escape to dismiss.
  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const rows: { label: string; get: (m: FlatModel) => React.ReactNode }[] = [
    { label: "Maker", get: (m) => m.parent },
    { label: "Body", get: (m) => m.bodyType },
    { label: "Class", get: (m) => m.classes.join(", ") },
    { label: "Years", get: (m) => m.years },
    { label: "Rating", get: (m) => m.rating },
    { label: "Power", get: (m) => m.hp },
    { label: "Engines", get: (m) => m.engines.join(", ") },
    { label: "Applications", get: (m) => m.applications.join(", ") },
  ];
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="showdown-title"
        className="relative bg-card w-full sm:max-w-4xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[94vh] overflow-y-auto outline-none"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-secondary text-white">
          <h2 id="showdown-title" className="text-lg font-extrabold flex items-center gap-2"><GitCompareArrows className="w-5 h-5" /> Spec Showdown</h2>
          <button onClick={onClose} aria-label="Close" className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[520px]">
            <thead>
              <tr>
                <th className="w-28 sm:w-36" />
                {models.map((m) => (
                  <th key={m.id} className="p-3 align-top">
                    <div className="rounded-xl px-3 py-3 text-white relative" style={{ background: `linear-gradient(135deg, ${m.makeColor}, ${m.makeColor2})` }}>
                      <button onClick={() => onRemove(m.id)} aria-label={`Remove ${m.make} ${m.model}`} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">{m.make}</div>
                      <div className="text-base font-extrabold leading-tight">{m.model}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 ? "bg-neutral-light/40" : ""}>
                  <td className="p-3 text-[11px] font-bold uppercase tracking-wider text-muted align-top">{row.label}</td>
                  {models.map((m) => (
                    <td key={m.id} className="p-3 text-sm text-foreground align-top">{row.get(m)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-3" />
                {models.map((m) => (
                  <td key={m.id} className="p-3">
                    <a href={partsHref(m.make, m.model)} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:gap-2 transition-all">
                      <Wrench className="w-3.5 h-3.5" /> Find parts
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- Main ----------
export default function TrucksExplorer({ currentYear }: { currentYear: number }) {
  const [query, setQuery] = useState("");
  const [make, setMake] = useState<string | null>(null);
  const [klass, setKlass] = useState<number | null>(null);
  const [body, setBody] = useState<BodyType | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_MODELS.filter((m) => {
      if (make && m.make !== make) return false;
      if (klass && !m.classes.includes(klass)) return false;
      if (body && m.bodyType !== body) return false;
      if (q) {
        const hay = `${m.make} ${m.model} ${m.engines.join(" ")} ${m.applications.join(" ")} ${m.bodyType}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, make, klass, body]);

  // Stable refs so memoized TruckCards don't re-render on every keystroke.
  const toggleCompare = useCallback((id: string) =>
    setCompareIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_COMPARE ? prev : [...prev, id]), []);
  const compareModels = compareIds.map((id) => ALL_MODELS.find((m) => m.id === id)).filter(Boolean) as FlatModel[];

  // Lock body scroll while the compare overlay is open.
  useEffect(() => {
    if (!showCompare) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [showCompare]);

  const hasFilters = query || make || klass || body;

  return (
    <div className="pb-28">
      {/* HERO */}
      <section className="relative overflow-hidden bg-secondary">
        <Image src="/trucks-images/2.png" alt="" fill sizes="100vw" priority className="object-cover opacity-[0.12]" />
        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary-light bg-white/10 border border-white/15 px-3 py-1 rounded-full">
            <Truck className="w-3.5 h-3.5" /> US Truck Encyclopedia
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mt-5 text-balance">Every truck that runs America&apos;s roads.</h1>
          <p className="text-lg text-white/70 mt-4 max-w-2xl mx-auto text-pretty">Specs, engines and history for every US commercial truck, Class 3 to 8 — and Mike, the free AI consultant, to help you diagnose yours and find the right part.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-10">
            <Stat target={TRUCK_STATS.makes} label="Makes" />
            <Stat target={TRUCK_STATS.models} label="Models" suffix="+" />
            <Stat target={TRUCK_STATS.engines} label="Engines" />
            <Stat target={currentYear - TRUCK_STATS.oldest} label="Years of iron" />
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="sticky top-[76px] z-30 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search make, model, engine…"
              aria-label="Search make, model, engine"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {hasFilters && (
              <button onClick={() => { setQuery(""); setMake(null); setKlass(null); setBody(null); }} aria-label="Clear filters" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <Chip active={!make && !klass && !body} onClick={() => { setMake(null); setKlass(null); setBody(null); }}>All</Chip>
            {MAKE_NAMES.map((mk) => (
              <Chip key={mk} active={make === mk} onClick={() => setMake(make === mk ? null : mk)}>{mk}</Chip>
            ))}
            <span className="w-px bg-border shrink-0 mx-1" />
            {ALL_CLASSES.map((c) => (
              <Chip key={c} active={klass === c} onClick={() => setKlass(klass === c ? null : c)}>{`Class ${c}`}</Chip>
            ))}
          </div>
        </div>
      </div>

      {/* GRID */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted">{filtered.length} {filtered.length === 1 ? "model" : "models"}</p>
          {BODY_TYPES.length > 0 && (
            <select
              value={body ?? ""}
              onChange={(e) => setBody((e.target.value || null) as BodyType | null)}
              aria-label="Filter by body type"
              className="text-sm rounded-lg border border-border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All body types</option>
              {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Truck className="w-12 h-12 text-muted/40 mx-auto mb-3" />
            <p className="text-muted">No trucks match those filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((m) => (
              <TruckCard
                key={m.id}
                model={m}
                inCompare={compareIds.includes(m.id)}
                onToggleCompare={toggleCompare}
              />
            ))}
          </div>
        )}
      </section>

      {/* COMPARE BAR */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-secondary text-white shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-3">
            <GitCompareArrows className="w-5 h-5 shrink-0" />
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {compareModels.map((m) => (
                <span key={m.id} className="text-xs font-semibold bg-white/12 border border-white/20 rounded-full pl-2.5 pr-1.5 py-1.5 flex items-center gap-1.5 shrink-0">
                  {m.make} {m.model}
                  <button onClick={() => toggleCompare(m.id)} aria-label={`Remove ${m.make} ${m.model}`} className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5" /></button>
                </span>
              ))}
              <span className="text-xs text-white/50 shrink-0">{compareIds.length}/{MAX_COMPARE}</span>
            </div>
            <button
              onClick={() => setShowCompare(true)}
              disabled={compareIds.length < 2}
              className="shrink-0 inline-flex items-center gap-1.5 bg-accent hover:bg-accent-dark disabled:opacity-40 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Compare <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showCompare && compareModels.length >= 2 && (
        <CompareModal models={compareModels} onClose={() => setShowCompare(false)} onRemove={(id) => toggleCompare(id)} />
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors ${
        active ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}
