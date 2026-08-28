import { headers } from "next/headers";
import type { SiteLocale } from "@/lib/use-browser-locale";

/** Best-effort locale for first paint (matches client readLocale without localStorage). */
export async function detectInitialLocale(): Promise<SiteLocale> {
  const h = await headers();
  const accept = h.get("accept-language") ?? "";
  return accept.toLowerCase().includes("es") ? "es" : "en";
}
