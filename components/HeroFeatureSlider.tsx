"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SWIPE_THRESHOLD_PX = 48;

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
  const stoppedRef = useRef(false);
  const touchStartX = useRef<number | null>(null);

  function goTo(next: number, manual = false) {
    if (manual) stoppedRef.current = true;
    setIndex(((next % count) + count) % count);
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

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Feature highlights"
      className="hero-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
          <button type="button" className="hero-slider-edge hero-slider-edge-left" aria-label="Previous slide" onClick={() => goTo(index - 1, true)}>
            <ChevronLeft aria-hidden size={24} />
          </button>
          <button type="button" className="hero-slider-edge hero-slider-edge-right" aria-label="Next slide" onClick={() => goTo(index + 1, true)}>
            <ChevronRight aria-hidden size={24} />
          </button>
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