"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SWIPE_THRESHOLD_PX = 48;
const EDGE_HOVER_RATIO = 0.4;

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

export function HeroFeatureSlider({
  children,
  autoAdvanceMs = 7000,
}: {
  children: React.ReactNode[];
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
    if (!el || !window.matchMedia("(min-width: 768px)").matches) {
      setHoverEdge(null);
      return;
    }
    const { left, width } = el.getBoundingClientRect();
    const ratio = (clientX - left) / width;
    if (ratio <= EDGE_HOVER_RATIO) setHoverEdge("left");
    else if (ratio >= 1 - EDGE_HOVER_RATIO) setHoverEdge("right");
    else setHoverEdge(null);
  }

  useEffect(() => {
    if (count <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!stoppedRef.current) setIndex((i) => (i + 1) % count);
    }, autoAdvanceMs);
    return () => clearInterval(id);
  }, [count, paused, autoAdvanceMs]);

  if (count === 0) return null;

  const edgeVisible = (side: HoverEdge) => hoverEdge === side;

  return (
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
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
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
              {slide}
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          {/* Visual wash only — pointer-events-none so slide CTAs stay clickable (partsnow.ai). */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[40%] md:block">
            <span
              aria-hidden
              className={`hero-slider-edge-wash absolute inset-y-0 -left-[10%] right-[-22%] transition-opacity duration-300 ${
                edgeVisible("left") ? "opacity-100" : "opacity-0"
              }`}
              style={EDGE_WASH_LEFT}
            />
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => goTo(index - 1, true)}
              className={`pointer-events-auto absolute inset-y-0 left-0 flex w-14 cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-opacity duration-300 ${
                edgeVisible("left") ? "opacity-100" : "opacity-0"
              }`}
            >
              <ChevronLeft
                aria-hidden
                strokeWidth={2.5}
                className="h-8 w-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
              />
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-[40%] md:block">
            <span
              aria-hidden
              className={`hero-slider-edge-wash absolute inset-y-0 -right-[10%] left-[-22%] transition-opacity duration-300 ${
                edgeVisible("right") ? "opacity-100" : "opacity-0"
              }`}
              style={EDGE_WASH_RIGHT}
            />
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => goTo(index + 1, true)}
              className={`pointer-events-auto absolute inset-y-0 right-0 flex w-14 cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-opacity duration-300 ${
                edgeVisible("right") ? "opacity-100" : "opacity-0"
              }`}
            >
              <ChevronRight
                aria-hidden
                strokeWidth={2.5}
                className="h-8 w-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
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
  );
}
