"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  HeroSliderActiveIndexProvider,
  HeroSliderSlideIndexProvider,
} from "@/lib/hero-slider-context";

const SWIPE_THRESHOLD_PX = 48;

const EDGE_WASH_LEFT: CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.12) 32%, rgba(0,0,0,0.04) 52%, transparent 72%)",
  filter: "blur(22px)",
};

const EDGE_WASH_RIGHT: CSSProperties = {
  background:
    "linear-gradient(270deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.12) 32%, rgba(0,0,0,0.04) 52%, transparent 72%)",
  filter: "blur(22px)",
};

type HoverEdge = "left" | "right" | null;

/** Match --edge-wash in globals.css */
function edgeHoverRatio(): number {
  if (typeof window === "undefined") return 0.26;
  if (window.matchMedia("(min-width: 1536px)").matches) return 0.44;
  if (window.matchMedia("(min-width: 1280px)").matches) return 0.4;
  if (window.matchMedia("(min-width: 1024px)").matches) return 0.34;
  if (window.matchMedia("(min-width: 768px)").matches) return 0.26;
  return 0;
}

export function HeroFeatureSlider({
  children,
  slidePhotos = [],
  autoAdvanceMs = 7000,
}: {
  children: React.ReactNode[];
  slidePhotos?: string[];
  autoAdvanceMs?: number;
}) {
  const slides = children.filter(Boolean);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoverEdge, setHoverEdge] = useState<HoverEdge>(null);
  const stoppedRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  function goTo(next: number, manual = false) {
    if (manual) stoppedRef.current = true;
    setIndex(((next % count) + count) % count);
  }

  function updateHoverEdge(clientX: number) {
    const el = sliderRef.current;
    const ratioLimit = edgeHoverRatio();
    if (!el || ratioLimit <= 0) {
      setHoverEdge(null);
      return;
    }
    const { left, width } = el.getBoundingClientRect();
    const ratio = (clientX - left) / width;
    if (ratio <= ratioLimit) setHoverEdge("left");
    else if (ratio >= 1 - ratioLimit) setHoverEdge("right");
    else setHoverEdge(null);
  }

  useEffect(() => {
    const onResize = () => setHoverEdge(null);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (count <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!stoppedRef.current) setIndex((i) => (i + 1) % count);
    }, autoAdvanceMs);
    return () => clearInterval(id);
  }, [count, paused, autoAdvanceMs]);

  useEffect(() => {
    if (!slidePhotos.length) return;
    const preload = (i: number) => {
      const src = slidePhotos[((i % count) + count) % count];
      if (!src) return;
      const img = new window.Image();
      img.src = src;
    };
    preload(index + 1);
    preload(index - 1);
  }, [index, slidePhotos, count]);

  if (count === 0) return null;

  const edgeVisible = (side: HoverEdge) => hoverEdge === side;
  const edgeFade = (side: HoverEdge) => (edgeVisible(side) ? "opacity-100" : "opacity-0");

  return (
    <HeroSliderActiveIndexProvider index={index}>
      <div
        ref={sliderRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Feature highlights"
        className="hero-slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          setHoverEdge(null);
        }}
        onMouseMove={(e) => updateHoverEdge(e.clientX)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
          goTo(index + (delta < 0 ? 1 : -1), true);
        }}
      >
        <div className="hero-slider-track-wrap">
          <div className="hero-slider-track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {slides.map((slide, i) => (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${count}`}
                aria-hidden={i !== index}
                inert={i !== index}
                className="hero-slider-slide"
              >
                <HeroSliderSlideIndexProvider index={i}>{slide}</HeroSliderSlideIndexProvider>
              </div>
            ))}
          </div>
        </div>

        {count > 1 && (
          <>
            <div className="hero-slider-edge hero-slider-edge--left">
              <span
                aria-hidden
                className={`hero-slider-edge-wash ${edgeFade("left")}`}
                style={EDGE_WASH_LEFT}
              />
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => goTo(index - 1, true)}
                className={`hero-slider-edge-hit ${edgeFade("left")}`}
              >
                <ChevronLeft
                  aria-hidden
                  strokeWidth={2.5}
                  className="hero-slider-edge-icon"
                />
              </button>
            </div>
            <div className="hero-slider-edge hero-slider-edge--right">
              <span
                aria-hidden
                className={`hero-slider-edge-wash ${edgeFade("right")}`}
                style={EDGE_WASH_RIGHT}
              />
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => goTo(index + 1, true)}
                className={`hero-slider-edge-hit ${edgeFade("right")}`}
              >
                <ChevronRight
                  aria-hidden
                  strokeWidth={2.5}
                  className="hero-slider-edge-icon"
                />
              </button>
            </div>
            <div className="hero-slider-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={`hero-slider-dot${i === index ? " is-active" : ""}`}
                  onClick={() => goTo(i, true)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </HeroSliderActiveIndexProvider>
  );
}
