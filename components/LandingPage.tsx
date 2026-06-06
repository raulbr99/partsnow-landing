"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

type ChatMsg = { role: "steve" | "user"; text: string };

const FALLBACK = "Got it — tell me more about the truck (make, model, year) and I'll point you in the right direction. Or call/text (865) 486-4003 and I'll help right now.";

const SEEDS: Record<string, string> = {
  symptom: "My truck's making a noise it wasn't making yesterday and I'm not sure what part I need.",
  photo: "I've got the old part in my hand but there's no number on it. Can I send you a photo so you can identify it?",
  vin: "Can you look up the right parts using my VIN? I'll give you the number.",
  es: "Hola Steve, necesito ayuda para encontrar una pieza para mi camión. ¿Me puedes ayudar?",
};

const FOLLOWUPS = ["It's a 2020 Kenworth T680", "Gets worse when I brake", "Can I just call instead?"];

const FAQ_ITEMS = [
  { q: "Do I have to buy anything?", a: "No. Ask Steve whatever you need and leave. The help is free." },
  { q: "Do I need to make an account?", a: "No account, no sign-up. Open the chat, call, or text and go." },
  { q: "What if I don't know the part name or number?", a: "That's the whole point of Steve. Describe the problem, send a photo, or give a VIN. He figures out the part and tells you where to start." },
  { q: "Can I call or text instead of typing?", a: 'Yes. Chat on the site, call, or text. English: <a href="tel:+18654864003">(865) 486-4003</a>. Spanish: <a href="tel:+18654864001">(865) 486-4001</a>. Both lines take calls and texts.' },
  { q: "Does Steve speak any other language?", a: 'Yes. Ask in Spanish and he\'ll answer in Spanish. The Spanish line is <a href="tel:+18654864001">(865) 486-4001</a>.' },
  { q: "What if I want to order the part?", a: "Steve can pull it from PartsNow.ai, new or OEM, and get it shipped or set up for pickup in Knoxville. Up to you." },
];

export function LandingPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [heroInput, setHeroInput] = useState("");
  const [ctaInput, setCtaInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  // Keep API-format history separately (excludes greeting)
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  const send = useCallback(async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    setSuggestions([]);
    setMessages((m) => [...m, { role: "user", text: t }]);
    historyRef.current.push({ role: "user", content: t });
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyRef.current }),
      });
      const data = await res.json();
      const reply: string = data.reply || FALLBACK;
      historyRef.current.push({ role: "assistant", content: reply });
      setTyping(false);
      setMessages((m) => {
        const next = [...m, { role: "steve" as const, text: reply }];
        if (next.length <= 4) setSuggestions(FOLLOWUPS);
        return next;
      });
    } catch {
      setTyping(false);
      setMessages((m) => [...m, { role: "steve" as const, text: FALLBACK }]);
    }

    setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [busy]);

  const openChat = useCallback((seedKey?: string) => {
    setChatOpen(true);
    if (!opened) {
      setOpened(true);
      setMessages([{ role: "steve", text: "Hey, I'm Steve — your parts guy at PartsNow. Tell me what's going on with your truck, or what part you're chasing. No account needed, and this is free." }]);
      setSuggestions(["It's making a noise", "Warning light is on", "I have a part number"]);
    }
    if (seedKey) {
      const seed = SEEDS[seedKey] || seedKey;
      setTimeout(() => send(seed), 360);
    }
    setTimeout(() => inputRef.current?.focus(), 280);
  }, [opened, send]);

  const closeChat = () => setChatOpen(false);

  const submitHero = (e: React.FormEvent) => {
    e.preventDefault();
    const t = heroInput.trim();
    openChat();
    if (t) { setTimeout(() => send(t), 360); setHeroInput(""); }
  };

  const submitCta = (e: React.FormEvent) => {
    e.preventDefault();
    const t = ctaInput.trim();
    openChat();
    if (t) { setTimeout(() => send(t), 360); setCtaInput(""); }
  };

  const sendFromPanel = () => {
    const t = inputRef.current;
    if (t) { send(t.value); t.value = ""; t.style.height = "auto"; }
  };

  return (
    <>
      {/* NAV */}
      <nav className="nav nav-main">
        <div className="wrap">
          <Image className="logo" src="/logo-white.svg" alt="PartsNow.ai" width={140} height={42} />
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#about">About us</a>
            <a href="#faq">FAQs</a>
          </div>
          <div className="nav-right">
            <button className="btn btn-chat btn-sm" onClick={() => openChat()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Chat with Steve
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero hero-chat">
        <div className="globe" />
        <div className="wrap">
          <div className="hero-center">
            <div className="steve-avatar">
              <Image className="sa-photo" src="/steve-face.png" alt="Steve" width={96} height={96} />
              <span className="sa-spark">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8z"/></svg>
              </span>
              <span className="sa-live" />
            </div>
            <p className="ava-cap">Steve · AI truck parts specialist</p>
            <h1>Truck down?<br /><span className="teal">Start here.</span></h1>
            <p className="sub">Steve is a <strong>free AI specialist for heavy-duty truck and trailer parts.</strong> Describe what you need, he&apos;ll help you identify the issue, find the right part, or point you in the right direction.</p>

            <form className="chatbox" onSubmit={submitHero} autoComplete="off">
              <input className="chatbox-input" type="text" value={heroInput} onChange={(e) => setHeroInput(e.target.value)} placeholder="Tell Steve what's going on with your truck…" />
              <button className="chatbox-send" type="submit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
              </button>
            </form>

            <div className="quick-chips">
              <button className="qchip" onClick={() => openChat("symptom")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h3l2-6 4 12 2-6h7"/></svg>
                Describe a symptom
              </button>
              <button className="qchip" onClick={() => openChat("photo")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.5"/></svg>
                Upload a photo
              </button>
              <button className="qchip" onClick={() => openChat("vin")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10v4M11 10v4M15 10l2 4M17 10l-2 4"/></svg>
                Enter a VIN
              </button>
              <button className="qchip qchip-es" onClick={() => openChat("es")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
                En español
              </button>
            </div>

            <p className="hero-microline">Free. No account. Or call/text: <a href="tel:+18654864003">(865) 486-4003</a> EN · <a href="tel:+18654864001">(865) 486-4001</a> ES</p>
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
              <span>That&apos;s what Steve is for.</span>
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
              <Image className="portrait-photo" src="/steve.png" alt="Steve, AI parts specialist" width={340} height={340} />
              <div className="online"><span className="dot" />Online now</div>
            </div>
          </div>
          <div className="info">
            <span className="eyebrow">Meet Steve</span>
            <h2>Your AI parts specialist.</h2>
            <p className="bio">Steve is an AI assistant with a deep knowledge base for heavy-duty trucks and trailers. Talk to him the way you&apos;d talk to a mechanic who knows your rig. He understands plain descriptions, so you don&apos;t need the right terms or the part number.</p>
            <p className="bio">Tell him what&apos;s happening and he&apos;ll lead you toward a fix: <strong>what else to check, what to fix first,</strong> and where a budget alternative makes sense if money&apos;s tight.</p>
            <blockquote className="pull-quote">
              <span className="qmark">&ldquo;</span>
              Tell me what the truck&apos;s doing. I&apos;ll help you figure out the part and where to start.
              <cite><span className="s-ava"><Image src="/steve-face.png" alt="" width={24} height={24} /></span>Steve</cite>
            </blockquote>
            <p className="bio reach-line"><strong>Reach him however&apos;s easiest:</strong></p>
            <div className="contact-cluster compact">
              <button className="btn btn-chat" onClick={() => openChat()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Chat with Steve
              </button>
              <a className="btn btn-call" href="tel:+18654864003">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call Steve
              </a>
              <a className="btn btn-text" href="sms:+18654864003">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
                Text Steve
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
              <h3>Tell Steve what&apos;s going on</h3>
              <p>Open the chat, call, or send a text. Describe the problem in your own words. Add a photo or VIN if you&apos;ve got one.</p>
            </div>
            <div className="step">
              <div className="num">02</div>
              <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg></div>
              <h3>He works it out with you</h3>
              <p>Steve asks a couple of quick questions if he needs to, then tells you the part, what to check first, and your options — including a budget alternative.</p>
            </div>
            <div className="step">
              <div className="num">03</div>
              <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.3 4.6a1 1 0 0 0 .9 1.4h11"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg></div>
              <h3>Order it, or don&apos;t</h3>
              <p>When you&apos;re ready, Steve can pull the part from <strong>PartsNow.ai</strong> and get it shipped or set up for pickup. No pressure — the answer is free whether you buy or not.</p>
            </div>
          </div>

          <div className="contact-cluster center" style={{ marginTop: 56 }}>
            <button className="btn btn-chat btn-lg" onClick={() => openChat()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Chat with Steve
            </button>
            <a className="btn btn-call btn-lg" href="tel:+18654864003">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Call Steve
            </a>
            <a className="btn btn-text btn-lg" href="sms:+18654864003">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
              Text Steve
            </a>
          </div>
          <p className="contact-lines center">English: <a href="tel:+18654864003">(865) 486-4003</a> · Español: <a href="tel:+18654864001">(865) 486-4001</a></p>

          <figure className="how-video after-cta">
            <figcaption>See Steve in action.</figcaption>
            <div className="video-frame">
              <button className="video-play" type="button" onClick={() => openChat()}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <span className="video-tag">Demo · 0:48</span>
              <span className="video-hint">See Steve in action — type a symptom, he names the part</span>
            </div>
          </figure>
        </div>
      </section>

      {/* REAL SITUATIONS */}
      <section className="section situations" id="situations">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Real situations</span>
            <h2>Stuff people ask Steve every day.</h2>
          </div>
          <div className="scenario-grid">
            <article className="scenario-card" style={{ backgroundImage: "url('/scene-brake-wheel.jpg')" }}>
              <span className="quote-icon">&ldquo;</span>
              <p className="ask">Grinding noise when I brake and a light on the dash. What do I fix first?</p>
              <div className="resolve"><span className="s-ava"><Image src="/steve-face.png" alt="" width={22} height={22} /></span>Steve walks through it and tells you where to start.</div>
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
              <div className="resolve"><span className="s-ava"><Image src="/steve-face.png" alt="" width={22} height={22} /></span>Steve&apos;s up. Chat, call, or text — he answers.</div>
              <a className="scenario-watch" href="https://youtube.com/shorts/h-LZ5V-Vofg" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Watch the video
              </a>
            </article>
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
          <h2>Your truck won&apos;t fix itself.<br />Ask Steve.</h2>
          <p>Free answer in about a minute. No account, no catch. Chat, call, or text — English or Spanish, any hour.</p>
          <form className="chatbox on-dark" onSubmit={submitCta} autoComplete="off">
            <input className="chatbox-input" type="text" value={ctaInput} onChange={(e) => setCtaInput(e.target.value)} placeholder="Tell Steve what's going on…" />
            <button className="chatbox-send" type="submit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
            </button>
          </form>
          <div className="cta-altlines">
            <a href="tel:+18654864003">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Call
            </a>
            <a href="sms:+18654864003">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
              Text
            </a>
            <span className="alt-nums">(865) 486-4003 EN · (865) 486-4001 ES</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer footer-slim">
        <div className="wrap">
          <div className="fbrand">
            <Image className="logo" src="/logo-white.svg" alt="PartsNow.ai" width={120} height={28} />
            <p className="blurb">AI-powered truck and trailer parts. 50,000+ parts from trusted dealers, shipped nationwide. Based in Knoxville, TN.</p>
          </div>
          <div className="fcontact-block">
            <div className="fcontact">
              EN <a href="tel:+18654864003">(865) 486-4003</a> · ES <a href="tel:+18654864001">(865) 486-4001</a><br />
              Both lines take calls and texts · <a href="mailto:support@partsnow.ai">support@partsnow.ai</a>
            </div>
            <div className="fsocial">
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z"/></svg>
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z"/></svg>
              </a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8zM9.6 15.6V8.4l6.27 3.6L9.6 15.6z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="wrap">
          <div className="fbottom">
            <span>© 2026 PartsNow.ai · An agentic commerce platform by talkrev.ai</span>
            <span>Knoxville, TN</span>
          </div>
        </div>
      </footer>

      {/* STEVE FAB */}
      {!chatOpen && (
        <button className="steve-fab" onClick={() => openChat()}>
          <span className="fab-ava">S</span>
          <span>Chat with Steve</span>
        </button>
      )}

      {/* OVERLAY */}
      <div className={`steve-overlay${chatOpen ? " open" : ""}`} onClick={closeChat} />

      {/* STEVE PANEL */}
      <div className={`steve-panel${chatOpen ? " open" : ""}`} role="dialog" aria-label="Chat with Steve">
        <div className="sp-head">
          <div className="sp-ava">S<span className="live" /></div>
          <div className="sp-meta">
            <div className="nm">Steve</div>
            <div className="st">
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success-500)", display: "inline-block" }} />
              Online · Parts consultant
            </div>
          </div>
          <a className="sp-call" href="tel:+18654864003">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Call
          </a>
          <button className="sp-close" onClick={closeChat} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="sp-body" ref={bodyRef}>
          {messages.map((m, i) => (
            <div key={i} className={`sp-msg ${m.role}`}>{m.text}</div>
          ))}
          {typing && (
            <div className="sp-typing"><span /><span /><span /></div>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="sp-suggest">
            {suggestions.map((s) => (
              <button key={s} className="sg" onClick={() => { setSuggestions([]); send(s); }}>{s}</button>
            ))}
          </div>
        )}

        <div className="sp-foot">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Describe the problem or part…"
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(e.currentTarget.value);
                e.currentTarget.value = "";
                e.currentTarget.style.height = "auto";
              }
            }}
          />
          <button className="sp-send" disabled={busy} onClick={sendFromPanel} aria-label="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
        <div className="sp-disclaim">Steve is an AI assistant. Always confirm safety-critical repairs with a pro.</div>
      </div>
    </>
  );
}
