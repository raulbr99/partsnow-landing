"use client";

import Image from "next/image";
import Link from "next/link";
import type { AgentFeatureSlide } from "@/lib/home-slides";
import { activateSlideHref } from "@/lib/resolve-slide-href";

function SlidePhoto({ src }: { src: string }) {
  if (/^https?:\/\//i.test(src)) {
    return <img src={src} alt="" className="hero-feature-photo-img hero-feature-photo-img--absolute" />;
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      className="hero-feature-photo-img"
      sizes="(max-width: 900px) 100vw, 560px"
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

export function AgentFeatureSlide({ slide }: { slide: AgentFeatureSlide }) {
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
                  Call Mike · (865) 290-5485
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
                <SlidePhoto src={slide.photo} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
