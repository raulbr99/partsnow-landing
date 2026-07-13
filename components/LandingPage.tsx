"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FAQ_ITEMS } from "@/app/faq-data";
import { openMikeChat } from "@/components/MikeChat";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const SEEDS: Record<string, string> = {
  symptom: "My truck's making a noise it wasn't making yesterday and I'm not sure what part I need.",
  photo: "I've got the old part in my hand but there's no number on it. Can I send you a photo so you can identify it?",
  vin: "Can you look up the right parts using my VIN? I'll give you the number.",
  es: "Hola Mike, necesito ayuda para encontrar una pieza para mi camión. ¿Me puedes ayudar?",
};

const DEMO_VIDEO = "https://hsgoueam2pjhncqb.public.blob.vercel-storage.com/mike-demo.mp4";

// App store destinations for the download banner badges — live store listings.
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=ai.partsnow.app";
const APP_STORE_URL = "https://apps.apple.com/app/id6779235305";

export function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [heroInput, setHeroInput] = useState("");
  const [ctaInput, setCtaInput] = useState("");
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Autoplay the demo as soon as the viewer taps the poster (carries the click gesture).
  useEffect(() => {
    if (videoPlaying) videoRef.current?.play().catch(() => {});
  }, [videoPlaying]);

  const submitHero = (e: React.FormEvent) => {
    e.preventDefault();
    openMikeChat(heroInput.trim() || undefined);
    setHeroInput("");
  };

  const submitCta = (e: React.FormEvent) => {
    e.preventDefault();
    openMikeChat(ctaInput.trim() || undefined);
    setCtaInput("");
  };

  return (
    <>
      <SiteNav />

      {/* HERO */}
      <header className="hero hero-chat">
        <div className="globe" />
        <div className="wrap">
          <div className="hero-center">
            <div className="steve-avatar">
              <Image className="sa-photo" src="/steve-face.png" alt="Mike" width={96} height={96} />
              <span className="sa-spark">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8z"/></svg>
              </span>
              <span className="sa-live" />
            </div>
            <p className="ava-cap">Mike · AI truck parts specialist</p>
            <h1>Truck down?<br /><span className="teal">Start here.</span></h1>
            <p className="sub">Mike is a <strong>free AI specialist for heavy-duty truck and trailer parts.</strong> Describe what you need, he&apos;ll help you identify the issue, find the right part, or point you in the right direction.</p>

            <form className="chatbox" onSubmit={submitHero} autoComplete="off">
              <input className="chatbox-input" type="text" value={heroInput} onChange={(e) => setHeroInput(e.target.value)} placeholder="Tell Mike what's going on with your truck…" />
              <button className="chatbox-send" type="submit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
              </button>
            </form>

            <div className="quick-chips">
              <button className="qchip" onClick={() => openMikeChat(SEEDS.symptom)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h3l2-6 4 12 2-6h7"/></svg>
                Describe a symptom
              </button>
              <button className="qchip" onClick={() => openMikeChat(undefined, { attach: true })}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.5"/></svg>
                Upload a photo
              </button>
              <button className="qchip" onClick={() => openMikeChat(SEEDS.vin)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10v4M11 10v4M15 10l2 4M17 10l-2 4"/></svg>
                Enter a VIN
              </button>
              <button className="qchip qchip-es" onClick={() => openMikeChat(SEEDS.es)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
                En español
              </button>
            </div>

            <p className="hero-microline">Free. No account. Or call/text: <a href="tel:+18652905485">(865) 290-5485</a> EN · <a href="tel:+18652175813">(865) 217-5813</a> ES</p>
          </div>
        </div>
      </header>

      {/* THE PROBLEM */}
      <section className="section problem">
        <div className="wrap">
          <div className="problem-inner">
            <h2>Stop searching.<br />Just describe it.</h2>
            <p>The truck&apos;s making a sound it didn&apos;t make yesterday. A light&apos;s on. Something&apos;s leaking and you&apos;re not sure from where. You don&apos;t need a catalogue with 50,000 parts to scroll through. You need a straight answer: <strong>what&apos;s wrong, which part fixes it, and what to do first.</strong></p>
            <div className="steve-for-box">
              <span>That&apos;s what Mike is for.</span>
              <span className="down-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MEET STEVE */}
      <section className="section meet" id="meet">
        <div className="wrap">
          <div className="portrait-col">
            <div className="steve-portrait">
              <Image className="portrait-photo" src="/steve.png" alt="Mike, AI parts specialist" width={340} height={340} />
              <div className="online"><span className="dot" />Online now</div>
            </div>
          </div>
          <div className="info">
            <span className="eyebrow">Meet Mike</span>
            <h2>Your AI parts specialist.</h2>
            <p className="bio">Mike is an AI assistant with a deep knowledge base for heavy-duty trucks and trailers. Talk to him the way you&apos;d talk to a mechanic who knows your rig. He understands plain descriptions, so you don&apos;t need the right terms or the part number.</p>
            <p className="bio">Tell him what&apos;s happening and he&apos;ll lead you toward a fix: <strong>what else to check, what to fix first,</strong> and where a budget alternative makes sense if money&apos;s tight.</p>
            <blockquote className="pull-quote">
              <span className="qmark">&ldquo;</span>
              Tell me what the truck&apos;s doing. I&apos;ll help you figure out the part and where to start.
              <cite><span className="s-ava"><Image src="/steve-face.png" alt="" width={24} height={24} /></span>Mike</cite>
            </blockquote>
            <p className="bio reach-line"><strong>Reach him however&apos;s easiest:</strong></p>
            <div className="contact-cluster compact">
              <button className="btn btn-chat" onClick={() => openMikeChat()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Chat with Mike
              </button>
              <a className="btn btn-call" href="tel:+18652905485">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call Mike
              </a>
              <a className="btn btn-text" href="sms:+18652905485">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
                Text Mike
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how" id="how">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">How it works</span>
            <h2>Three steps. No part number required.</h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="num">01</div>
              <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
              <h3>Tell Mike what&apos;s going on</h3>
              <p>Open the chat, call, or send a text. Describe the problem in your own words. Add a photo or VIN if you&apos;ve got one.</p>
            </div>
            <div className="step">
              <div className="num">02</div>
              <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg></div>
              <h3>He works it out with you</h3>
              <p>Mike asks a couple of quick questions if he needs to, then tells you the part, what to check first, and your options — including a budget alternative.</p>
            </div>
            <div className="step">
              <div className="num">03</div>
              <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.3 4.6a1 1 0 0 0 .9 1.4h11"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg></div>
              <h3>Order it, or don&apos;t</h3>
              <p>When you&apos;re ready, Mike can pull the part from <strong>PartsNow.ai</strong> and get it shipped or set up for pickup. No pressure — the answer is free whether you buy or not.</p>
            </div>
          </div>

          <div className="contact-cluster center" style={{ marginTop: 56 }}>
            <button className="btn btn-chat btn-lg" onClick={() => openMikeChat()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Chat with Mike
            </button>
            <a className="btn btn-call btn-lg" href="tel:+18652905485">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Call Mike
            </a>
            <a className="btn btn-text btn-lg" href="sms:+18652905485">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
              Text Mike
            </a>
          </div>
          <p className="contact-lines center">English: <a href="tel:+18652905485">(865) 290-5485</a> · Español: <a href="tel:+18652175813">(865) 217-5813</a> — calls and texts</p>

          <figure className="how-video after-cta">
            <figcaption>See Mike in action.</figcaption>
            <div className="video-frame">
              {videoPlaying ? (
                <video
                  ref={videoRef}
                  className="video-el"
                  src={DEMO_VIDEO}
                  poster="/demo-poster.jpg"
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                />
              ) : (
                <button className="video-poster" type="button" onClick={() => setVideoPlaying(true)} aria-label="Play the Mike demo video">
                  <Image className="video-poster-img" src="/demo-poster.jpg" alt="" width={1600} height={900} sizes="(max-width: 800px) 100vw, 760px" priority={false} />
                  <span className="video-scrim" />
                  <span className="video-play">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </span>
                  <span className="video-tag">Demo · 0:31</span>
                  <span className="video-hint">See Mike in action — type a symptom, he names the part</span>
                </button>
              )}
            </div>
          </figure>
        </div>
      </section>

      {/* REAL SITUATIONS */}
      <section className="section situations" id="situations">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Real situations</span>
            <h2>Stuff people ask Mike every day.</h2>
          </div>
          <div className="scenario-grid">
            <article className="scenario-card" style={{ backgroundImage: "url('/scene-brake-wheel.jpg')" }}>
              <span className="quote-icon">&ldquo;</span>
              <p className="ask">Grinding noise when I brake and a light on the dash. What do I fix first?</p>
              <div className="resolve"><span className="s-ava"><Image src="/steve-face.png" alt="" width={22} height={22} /></span>Mike walks through it and tells you where to start.</div>
              <a className="scenario-watch" href="https://youtube.com/shorts/Ypnt4WmSMS4" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Watch the video
              </a>
            </article>
            <article className="scenario-card" style={{ backgroundImage: "url('/scene-mechanic-part.jpg')" }}>
              <span className="quote-icon">&ldquo;</span>
              <p className="ask">I&apos;ve got the old part in my hand but no number on it. Here&apos;s a photo.</p>
              <div className="resolve"><span className="s-ava"><Image src="/steve-face.png" alt="" width={22} height={22} /></span>Send the picture. He&apos;ll match it.</div>
              <a className="scenario-watch" href="https://youtube.com/shorts/F5T3WIJqd0Y" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Watch the video
              </a>
            </article>
            <article className="scenario-card" style={{ backgroundImage: "url('/scene-night-call.jpg')" }}>
              <span className="quote-icon">&ldquo;</span>
              <p className="ask">Truck&apos;s down at 2 a.m. and every counter&apos;s closed. Can you help?</p>
              <div className="resolve"><span className="s-ava"><Image src="/steve-face.png" alt="" width={22} height={22} /></span>Mike&apos;s up. Chat, call, or text — he answers.</div>
              <a className="scenario-watch" href="https://youtube.com/shorts/h-LZ5V-Vofg" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Watch the video
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* TRUCK ENCYCLOPEDIA */}
      <section className="section trucks-promo" id="trucks">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">US Truck Encyclopedia</span>
            <h2>Know your truck. Every make, every model.</h2>
            <p>Specs, engines and history for every US commercial truck, Class 3 to 8 — with Mike on every page to help you diagnose yours.</p>
          </div>
          <div className="trucks-promo-cta">
            <Link className="btn btn-chat btn-lg" href="/trucks">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18h14M5 18a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8l4 4h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2"/><circle cx="8" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
              Browse the truck encyclopedia
            </Link>
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section className="section app-download">
        <div className="wrap">
          <div className="app-banner-wrap">
            <Image
              className="app-banner"
              src="/app-download-banner.png"
              alt="Download the new PartsNow app — live video, chat, and catalogue search to find the right truck or trailer part in seconds. Available on Google Play and the App Store."
              width={2400}
              height={1256}
              sizes="(max-width: 1200px) calc(100vw - 64px), 1136px"
            />
            <a className="badge-link badge-gp" href={GOOGLE_PLAY_URL} target="_blank" rel="noopener" aria-label="Get the PartsNow app on Google Play" />
            <a className="badge-link badge-as" href={APP_STORE_URL} target="_blank" rel="noopener" aria-label="Download the PartsNow app on the App Store" />
          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section className="about-section" id="about">
        <div className="globe" />
        <div className="wrap">
          <div className="about-head">
            <Image className="about-logo" src="/logo-white.svg" alt="PartsNow.ai" width={180} height={64} />
            <span className="trust-eyebrow">About us</span>
            <p className="about-lead"><strong>PartsNow.ai is an AI-powered agentic commerce platform</strong> connecting fleet operators, repair shops, and owner-operators with the parts they need.</p>
          </div>
          <div className="stats">
            <div className="stat"><div className="n">50,000+</div><div className="l">New &amp; OEM parts</div></div>
            <div className="stat"><div className="n">93</div><div className="l">Trusted dealers</div></div>
            <div className="stat"><div className="n">Knoxville, TN</div><div className="l">Nationwide shipping</div></div>
            <div className="stat"><div className="n">Free</div><div className="l">Local pickup</div></div>
          </div>
          <div className="about-cta">
            <div className="ac-copy">
              <h3>Already know the part?</h3>
              <p>Browse the full catalogue — 50,000+ new and OEM parts, shipped nationwide with free local pickup in Knoxville.</p>
            </div>
            <a className="btn-catalogue-light" href="https://partsnow.ai" target="_blank" rel="noopener">
              Browse the catalogue
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section faq" id="faq">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Quick questions</span>
            <h2>The straight answers.</h2>
          </div>
          <div className="faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className={`faq-item${faqOpen === i ? " open" : ""}`}>
                <button className="faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {item.q}<span className="pm" />
                </button>
                <div className="faq-a" style={{ maxHeight: faqOpen === i ? 300 : 0 }}>
                  <p dangerouslySetInnerHTML={{ __html: item.a }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="globe" />
        <div className="wrap">
          <h2>Your truck won&apos;t fix itself.<br />Ask Mike.</h2>
          <p>Free answer in about a minute. No account, no catch. Chat, call, or text — English or Spanish, any hour.</p>
          <form className="chatbox on-dark" onSubmit={submitCta} autoComplete="off">
            <input className="chatbox-input" type="text" value={ctaInput} onChange={(e) => setCtaInput(e.target.value)} placeholder="Tell Mike what's going on…" />
            <button className="chatbox-send" type="submit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
            </button>
          </form>
          <div className="cta-altlines">
            <a href="tel:+18652905485">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Call
            </a>
            <a href="sms:+18652905485">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
              Text
            </a>
            <span className="alt-nums">(865) 290-5485 EN · (865) 217-5813 ES</span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
