"use client";

import { useEffect, useState } from "react";

export type SiteLocale = "en" | "es";

const LANG_EVENT = "partsnow-lang";

function readLocale(): SiteLocale {
  if (typeof window === "undefined") return "en";
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("lang");
  if (forced === "es" || forced === "en") return forced;
  const stored = window.localStorage.getItem(LANG_EVENT);
  if (stored === "es" || stored === "en") return stored;
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

/** Browser / ?lang= / localStorage preference for bilingual slide copy. */
export function useBrowserLocale(initial: SiteLocale = "en"): SiteLocale {
  const [locale, setLocale] = useState<SiteLocale>(initial);

  useEffect(() => {
    setLocale(readLocale());
    const onLang = (e: Event) => {
      const next = (e as CustomEvent<SiteLocale>).detail;
      if (next === "es" || next === "en") setLocale(next);
    };
    window.addEventListener(LANG_EVENT, onLang);
    return () => window.removeEventListener(LANG_EVENT, onLang);
  }, []);

  return locale;
}

export function setSiteLocale(locale: SiteLocale) {
  window.localStorage.setItem(LANG_EVENT, locale);
  window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: locale }));
}
