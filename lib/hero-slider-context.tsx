"use client";

import { createContext, useContext } from "react";

const ActiveIndexContext = createContext(0);
const SlideIndexContext = createContext(0);

export function HeroSliderActiveIndexProvider({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return <ActiveIndexContext.Provider value={index}>{children}</ActiveIndexContext.Provider>;
}

export function HeroSliderSlideIndexProvider({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return <SlideIndexContext.Provider value={index}>{children}</SlideIndexContext.Provider>;
}

export function useHeroSliderActiveIndex() {
  return useContext(ActiveIndexContext);
}

export function useHeroSliderSlideIndex() {
  return useContext(SlideIndexContext);
}

/** Load portrait for active slide and immediate neighbors only. */
export function useShouldLoadSlidePhoto() {
  const active = useHeroSliderActiveIndex();
  const slide = useHeroSliderSlideIndex();
  return Math.abs(slide - active) <= 1;
}
