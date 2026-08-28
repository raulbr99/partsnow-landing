"use client";

import Image from "next/image";
import Link from "next/link";
import type { AgentFeatureSlide } from "@/lib/home-slides";
import { useShouldLoadSlidePhoto, useHeroSliderActiveIndex, useHeroSliderSlideIndex } from "@/lib/hero-slider-context";
import { activateSlideHref } from "@/lib/resolve-slide-href";

function SlidePhoto({ src, priority }: { src: string; priority?: boolean }) {
  if (/^https?:\/\//i.test(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="hero-feature-photo-img hero-feature-photo-img--absolute"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
      />
    );
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      className="hero-feature-photo-img"
      sizes="(max-width: 900px) 100vw, 560px"
      priority={priority}
      loading={priority ? undefined : "lazy"}
    />
  );
}

function SlideCta({ href, label }: { href: string; label: string }) {
  if (href.startsWith("chat:")) {
    return (
      <button type="button" className="btn btn-chat btn-lg" onClick={() => activateSlideHref(href)}>
        {label}
      </button>
    );
  }
  if (href.startsWith("/")) {
    return (
      <Link className="btn btn-chat btn-lg" href={href}>
        {label}
      </Link>
    );
  }
  return (
    <a className="btn btn-chat btn-lg" href={href}>
      {label}
    </a>
  );
}

export function AgentFeatureSlide({
  slide,
  locale = "en",
}: {
  slide: AgentFeatureSlide;
  locale?: "en" | "es";
}) {
  const shouldLoadPhoto = useShouldLoadSlidePhoto();
  const isActive = useHeroSliderActiveIndex() === useHeroSliderSlideIndex();

  return (
    <div className="hero-feature-slide">
      <div className="wrap hero-feature-inner">
        <div className="hero-feature-grid">
          <div className="hero-feature-copy">
            {slide.eyebrow ? (
              <span className="eyebrow on-dark hero-feature-eyebrow">{slide.eyebrow}</span>
            ) : null}
            <h2 className="hero-feature-title">{slide.title}</h2>
            <p className="hero-feature-desc">{slide.description}</p>
            <div className="hero-feature-actions">
              <SlideCta href={slide.href} label={slide.cta} />
              {slide.showCall && (
                <a className="btn btn-call btn-lg" href="tel:+18652905485">
                  {locale === "es" ? "Llamar a Mike · (865) 290-5485" : "Call Mike · (865) 290-5485"}
                </a>
              )}
            </div>
            {slide.bullets.length > 0 && (
              <ul className="hero-feature-bullets">
                {slide.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </div>
          {slide.photo ? (
            <div className="hero-feature-visual">
              <div className="hero-feature-portrait">
                {shouldLoadPhoto ? (
                  <SlidePhoto src={slide.photo} priority={isActive} />
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
