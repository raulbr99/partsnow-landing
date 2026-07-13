import { ALL_MODELS, type FlatModel, makeSlug, modelSlug } from "./trucks-data";

// Curated head-to-head comparisons — the rivalries people actually search for.
// Pairs reference model ids from trucks-data; unknown ids are dropped silently
// so dataset edits never break the build.
const PAIR_IDS: [string, string][] = [
  // Class 8 on-highway: the big four
  ["kenworth-t680", "peterbilt-579"],
  ["kenworth-t680", "freightliner-cascadia"],
  ["peterbilt-579", "freightliner-cascadia"],
  ["freightliner-cascadia", "volvo-trucks-vnl"],
  ["kenworth-t680", "volvo-trucks-vnl"],
  ["peterbilt-579", "volvo-trucks-vnl"],
  ["mack-trucks-anthem", "freightliner-cascadia"],
  ["international-lt-series", "freightliner-cascadia"],
  ["mack-trucks-anthem", "international-lt-series"],
  ["international-prostar", "freightliner-cascadia"],
  // Long-hood icons
  ["kenworth-w900", "peterbilt-389"],
  ["kenworth-w900", "kenworth-t680"],
  ["peterbilt-389", "peterbilt-579"],
  ["kenworth-w900", "freightliner-classic-xl"],
  ["western-star-4900", "kenworth-w900"],
  ["international-lonestar", "kenworth-w900"],
  ["peterbilt-389", "international-lonestar"],
  // Vocational / severe duty
  ["kenworth-t880", "peterbilt-567"],
  ["mack-trucks-granite", "kenworth-t880"],
  ["mack-trucks-granite", "peterbilt-567"],
  ["freightliner-114sd", "kenworth-t880"],
  ["western-star-49x", "kenworth-t880"],
  ["western-star-49x", "mack-trucks-granite"],
  ["international-hx-series", "western-star-49x"],
  ["kenworth-t800", "kenworth-t880"],
  ["kenworth-t800", "kenworth-w900"],
  // Medium duty
  ["freightliner-m2-106", "international-mv-series"],
  ["freightliner-m2-106", "kenworth-t270-t370"],
  ["peterbilt-337", "freightliner-m2-106"],
  ["ford-f-750", "freightliner-m2-106"],
  ["ford-f-650", "chevrolet-silverado-6500-hd"],
  ["hino-258", "isuzu-f-series-ftr-fvr-"],
  // Refuse
  ["peterbilt-520", "mack-trucks-terrapro"],
  ["autocar-acx", "battle-motors-let2"],
  // Electric
  ["freightliner-ecascadia", "tesla-semi"],
  ["tesla-semi", "kenworth-t680"],
  // Generations
  ["freightliner-cascadia", "freightliner-columbia"],
];

export interface ComparePair {
  slug: string;
  a: FlatModel;
  b: FlatModel;
}

function pairSlug(a: FlatModel, b: FlatModel): string {
  return `${makeSlug(a.make)}-${modelSlug(a.model)}-vs-${makeSlug(b.make)}-${modelSlug(b.model)}`;
}

const byId = new Map(ALL_MODELS.map((m) => [m.id, m]));

export const COMPARE_PAIRS: ComparePair[] = PAIR_IDS.flatMap(([ia, ib]) => {
  const a = byId.get(ia);
  const b = byId.get(ib);
  return a && b ? [{ slug: pairSlug(a, b), a, b }] : [];
});

export function findComparePair(slug: string): ComparePair | undefined {
  return COMPARE_PAIRS.find((p) => p.slug === slug);
}

export function comparesForModel(modelId: string): ComparePair[] {
  return COMPARE_PAIRS.filter((p) => p.a.id === modelId || p.b.id === modelId);
}

export function compareHref(pair: ComparePair): string {
  return `/trucks/compare/${pair.slug}`;
}
