import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { IMAGE_CREDITS } from "@/lib/trucks-images";

export const metadata: Metadata = {
  title: "Truck photo credits | PartsNow.ai",
  description: "Attribution for the truck photos used on the PartsNow truck encyclopedia.",
  alternates: { canonical: "/trucks/credits" },
  robots: { index: false },
};

export default function TruckCreditsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/trucks" className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to trucks
      </Link>
      <h1 className="text-3xl font-extrabold text-foreground mt-4 mb-2">Truck photo credits</h1>
      <p className="text-muted text-sm mb-8 max-w-xl">
        Model photos are sourced from Wikimedia Commons under their respective free licenses
        (CC0, Public Domain, CC BY and CC BY-SA). Our thanks to the photographers who made them available.
      </p>
      <ul className="divide-y divide-border border-y border-border">
        {IMAGE_CREDITS.map((c) => (
          <li key={c.id} className="py-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
            <span className="font-semibold text-foreground">{c.label}</span>
            <span className="text-muted">— {c.author}</span>
            <span className="text-[11px] font-medium text-muted bg-neutral-light rounded px-1.5 py-0.5">{c.license}</span>
            <a href={c.source} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-primary hover:underline">
              source <ExternalLink className="w-3 h-3" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
