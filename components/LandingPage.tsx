"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  MapPin, Sparkles, MessageSquare, ScanLine, Camera, Search,
  ImageUp, Upload, ArrowRight, Truck, ListChecks,
  Disc, Wind, Lightbulb, Cog, Filter, Droplets,
  Plus, Minus, Phone, Mail, Send, X, Menu, Image as ImageIcon,
  ScanSearch, GitCommitHorizontal,
} from "lucide-react";

// ─── i18n ────────────────────────────────────────────────────────────────────

type FaqItem = [string, string];

interface Copy {
  announce: string;
  nav_how: string; nav_ways: string; nav_cats: string; nav_faq: string; nav_cta: string;
  phone_en: string; phone_es: string;
  hero_eyebrow: string; hero_title_1: string; hero_title_2: string; hero_sub: string;
  mode_describe: string; mode_vin: string; mode_photo: string;
  ph_describe: string; ph_vin: string; ph_photo: string;
  hero_btn: string; hero_btn_photo: string;
  stat_parts: string; stat_dealers: string; stat_ai: string; stat_ai_val: string;
  stat_lang: string; stat_lang_val: string;
  pv_title: string; pv_status: string; pv_u1: string; pv_a1: string; pv_open: string;
  in_stock: string;
  ways_eyebrow: string; ways_title: string; ways_sub: string;
  way1_t: string; way1_d: string; way2_t: string; way2_d: string; way3_t: string; way3_d: string;
  way_cta: string;
  how_eyebrow: string; how_title: string;
  how1_t: string; how1_d: string; how2_t: string; how2_d: string; how3_t: string; how3_d: string;
  cat_eyebrow: string; cat_title: string; cat_all: string;
  cat_brakes: string; cat_air: string; cat_elec: string; cat_engine: string;
  cat_filt: string; cat_trailer: string; cat_drive: string; cat_hyd: string;
  faq_eyebrow: string; faq_title: string; faq: FaqItem[];
  cta_eyebrow: string; cta_title: string; cta_sub: string; cta_btn: string; cta_call: string;
  foot_blurb: string; foot_cats: string; foot_res: string; foot_pol: string;
  res_items: string[]; pol_items: string[];
  foot_rights: string; foot_operated: string; foot_secured: string;
  chat_title: string; chat_status: string; chat_help: string; chat_input: string;
  chat_sugg: string[]; chat_reply: string; chat_reply_photo: string; chat_vendor: string;
}

const EN: Copy = {
  announce: "Free Pickup — 2607 Middlebrook Pike, Knoxville, TN 37921",
  nav_how: "How It Works", nav_ways: "Ask the AI", nav_cats: "Categories", nav_faq: "FAQ",
  nav_cta: "Try the Assistant",
  phone_en: "English (865) 486-4003", phone_es: "Español (865) 486-4001",
  hero_eyebrow: "AGENTIC PARTS COMMERCE",
  hero_title_1: "Find any truck or trailer part —", hero_title_2: "just ask.",
  hero_sub: "Describe the symptom, paste a VIN, or snap a photo. The PartsNow AI searches 50,000+ parts with OEM cross-references and gets them shipped from Knoxville.",
  mode_describe: "Describe", mode_vin: "VIN", mode_photo: "Photo",
  ph_describe: "I need brake drums for a Peterbilt 579…",
  ph_vin: "Paste a 17-digit VIN…",
  ph_photo: "Upload a photo of the part…",
  hero_btn: "Ask Now", hero_btn_photo: "Upload Photo",
  stat_parts: "Parts in catalog", stat_dealers: "Trusted dealers",
  stat_ai: "AI assistant", stat_ai_val: "24/7",
  stat_lang: "Bilingual", stat_lang_val: "EN / ES",
  pv_title: "PartsNow AI", pv_status: "Online",
  pv_u1: "I need brake drums for a 2019 Peterbilt 579, Cummins X15.",
  pv_a1: "Found 2 brake drums that fit your Peterbilt 579. Both in stock in Knoxville.",
  pv_open: "Open full assistant →", in_stock: "In stock",
  ways_eyebrow: "THREE WAYS TO ASK",
  ways_title: "However you describe it, the AI finds it",
  ways_sub: "Text, voice, or a photo — in English or Spanish. No part number required.",
  way1_t: "Describe it",
  way1_d: "Tell the AI the symptom or what you need in plain language. It maps your words to the right part.",
  way2_t: "Snap a photo",
  way2_d: "Upload an image of the worn part. Visual Part ID identifies it and finds exact replacements.",
  way3_t: "Paste a VIN",
  way3_d: "Enter a VIN and get parts guaranteed to fit that exact truck, with OEM cross-references.",
  way_cta: "Try it",
  how_eyebrow: "HOW IT WORKS", how_title: "From question to parts on the dock",
  how1_t: "Ask", how1_d: "Describe what you need, paste a VIN, or send a photo. English or Spanish.",
  how2_t: "Compare", how2_d: "The AI returns matches with OEM cross-references, live stock, and dealer pricing.",
  how3_t: "Get your parts", how3_d: "Ship nationwide in 3–5 business days, or pick up free in Knoxville, TN.",
  cat_eyebrow: "BROWSE THE CATALOG", cat_title: "50,000+ parts across every system",
  cat_all: "View all parts →",
  cat_brakes: "Brakes & Wheel End", cat_air: "Air System",
  cat_elec: "Electrical & Lighting", cat_engine: "Engine",
  cat_filt: "Filtration", cat_trailer: "Trailer Parts",
  cat_drive: "Driveline", cat_hyd: "Hydraulics",
  faq_eyebrow: "FAQ", faq_title: "Questions, answered",
  faq: [
    ["How accurate is the AI part finder?", "It matches your description, VIN, or photo against 50,000+ parts with OEM cross-references from trusted dealers. Every result shows the dealer, fitment notes, and live stock so you can confirm before you buy."],
    ["Do you ship nationwide?", "Yes. We ship anywhere in the United States from Knoxville, TN — standard 3–5 business days. Free pickup is available at 2607 Middlebrook Pike."],
    ["Can I talk to a real person?", "Always. Bilingual support is available at English (865) 486-4003 and Español (865) 486-4001. The AI handles the search; our team handles anything it can't."],
    ["What if the part doesn't fit?", "Every order is covered by a 30-day return window. If a part doesn't fit or isn't what you needed, send it back."],
    ["Which truck makes do you support?", "Peterbilt, Kenworth, Freightliner, International, Mack, Volvo, and Western Star — plus trailer parts across all major manufacturers."],
    ["How do I pay, and can I request a quote?", "Secure checkout via Stripe accepts all major cards. Some items are quote-required — the AI flags those and routes you to a fast quote."],
  ],
  cta_eyebrow: "READY WHEN YOU ARE",
  cta_title: "Find your part in the next minute",
  cta_sub: "Open the assistant and describe what you need. No account required to search.",
  cta_btn: "Try the AI Assistant", cta_call: "Call English (865) 486-4003",
  foot_blurb: "AI-powered agentic commerce for heavy-duty truck and trailer parts. 50,000+ parts from trusted dealers, shipped nationwide from Knoxville, TN.",
  foot_cats: "Categories", foot_res: "Resources", foot_pol: "Policies",
  res_items: ["Catalog", "AI Part Finder", "Visual Part ID", "VIN Lookup", "About", "Contact"],
  pol_items: ["Shipping Policy", "Return Policy", "Terms of Service", "Privacy Policy"],
  foot_rights: "All rights reserved.",
  foot_operated: "partsnow.ai is operated by Post Equipment, Inc.",
  foot_secured: "Secured by Stripe",
  chat_title: "PartsNow AI", chat_status: "Parts assistant · EN / ES",
  chat_help: "How can I help you find a part?",
  chat_input: "Ask about any truck part…",
  chat_sugg: ["I need brake drums for a Peterbilt 579", "Oil filters for a Kenworth T680", "Paste a VIN"],
  chat_reply: "Here are 2 parts that fit. Both are in stock in Knoxville and ship nationwide.",
  chat_reply_photo: "Got it — analyzing the photo. Based on the housing, here are 2 likely matches in stock.",
  chat_vendor: "Dealer",
};

const ES: Copy = {
  announce: "Recogida gratis — 2607 Middlebrook Pike, Knoxville, TN 37921",
  nav_how: "Cómo Funciona", nav_ways: "Pregunta a la IA", nav_cats: "Categorías", nav_faq: "Preguntas",
  nav_cta: "Probar el Asistente",
  phone_en: "Inglés (865) 486-4003", phone_es: "Español (865) 486-4001",
  hero_eyebrow: "COMERCIO DE PARTES CON IA",
  hero_title_1: "Encuentra cualquier parte de camión o tráiler —", hero_title_2: "solo pregunta.",
  hero_sub: "Describe el síntoma, pega un VIN o haz una foto. La IA de PartsNow busca entre más de 50,000 partes con referencias cruzadas OEM y las envía desde Knoxville.",
  mode_describe: "Describir", mode_vin: "VIN", mode_photo: "Foto",
  ph_describe: "Necesito tambores de freno para un Peterbilt 579…",
  ph_vin: "Pega un VIN de 17 dígitos…",
  ph_photo: "Sube una foto de la parte…",
  hero_btn: "Preguntar", hero_btn_photo: "Subir Foto",
  stat_parts: "Partes en catálogo", stat_dealers: "Dealers de confianza",
  stat_ai: "Asistente IA", stat_ai_val: "24/7",
  stat_lang: "Bilingüe", stat_lang_val: "EN / ES",
  pv_title: "PartsNow IA", pv_status: "En línea",
  pv_u1: "Necesito tambores de freno para un Peterbilt 579 2019, Cummins X15.",
  pv_a1: "Encontré 2 tambores de freno para tu Peterbilt 579. Ambos en stock en Knoxville.",
  pv_open: "Abrir asistente completo →", in_stock: "En stock",
  ways_eyebrow: "TRES FORMAS DE PREGUNTAR",
  ways_title: "Como lo describas, la IA lo encuentra",
  ways_sub: "Texto, voz o una foto — en inglés o español. Sin número de parte.",
  way1_t: "Descríbelo",
  way1_d: "Dile a la IA el síntoma o lo que necesitas en lenguaje natural. Traduce tus palabras a la parte correcta.",
  way2_t: "Haz una foto",
  way2_d: "Sube una imagen de la parte desgastada. Visual Part ID la identifica y encuentra reemplazos exactos.",
  way3_t: "Pega un VIN",
  way3_d: "Ingresa un VIN y obtén partes garantizadas para ese camión, con referencias cruzadas OEM.",
  way_cta: "Probar",
  how_eyebrow: "CÓMO FUNCIONA", how_title: "De la pregunta a las partes en el muelle",
  how1_t: "Pregunta", how1_d: "Describe lo que necesitas, pega un VIN o envía una foto. En inglés o español.",
  how2_t: "Compara", how2_d: "La IA devuelve coincidencias con referencias OEM, stock en vivo y precios de dealer.",
  how3_t: "Recibe tus partes", how3_d: "Envío nacional en 3–5 días hábiles, o recogida gratis en Knoxville, TN.",
  cat_eyebrow: "EXPLORA EL CATÁLOGO", cat_title: "Más de 50,000 partes en cada sistema",
  cat_all: "Ver todas las partes →",
  cat_brakes: "Frenos y Cubo", cat_air: "Sistema de Aire",
  cat_elec: "Eléctrico e Iluminación", cat_engine: "Motor",
  cat_filt: "Filtración", cat_trailer: "Partes de Tráiler",
  cat_drive: "Transmisión", cat_hyd: "Hidráulica",
  faq_eyebrow: "PREGUNTAS", faq_title: "Preguntas, respondidas",
  faq: [
    ["¿Qué tan precisa es la búsqueda con IA?", "Compara tu descripción, VIN o foto contra más de 50,000 partes con referencias cruzadas OEM de dealers de confianza. Cada resultado muestra el dealer, notas de compatibilidad y stock en vivo para que confirmes antes de comprar."],
    ["¿Envían a todo el país?", "Sí. Enviamos a cualquier punto de Estados Unidos desde Knoxville, TN — estándar de 3 a 5 días hábiles. Recogida gratis disponible en 2607 Middlebrook Pike."],
    ["¿Puedo hablar con una persona real?", "Siempre. Soporte bilingüe en Inglés (865) 486-4003 y Español (865) 486-4001. La IA hace la búsqueda; nuestro equipo se encarga de lo demás."],
    ["¿Qué pasa si la parte no encaja?", "Cada pedido tiene una ventana de devolución de 30 días. Si una parte no encaja o no es lo que necesitabas, devuélvela."],
    ["¿Qué marcas de camión soportan?", "Peterbilt, Kenworth, Freightliner, International, Mack, Volvo y Western Star — más partes de tráiler de todos los fabricantes principales."],
    ["¿Cómo pago, y puedo pedir una cotización?", "Pago seguro vía Stripe con todas las tarjetas principales. Algunos artículos requieren cotización — la IA los marca y te lleva a una cotización rápida."],
  ],
  cta_eyebrow: "CUANDO ESTÉS LISTO",
  cta_title: "Encuentra tu parte en el próximo minuto",
  cta_sub: "Abre el asistente y describe lo que necesitas. No necesitas cuenta para buscar.",
  cta_btn: "Probar el Asistente de IA", cta_call: "Llama Inglés (865) 486-4003",
  foot_blurb: "Comercio agéntico con IA para partes de camión y tráiler de alto rendimiento. Más de 50,000 partes de dealers de confianza, enviadas desde Knoxville, TN.",
  foot_cats: "Categorías", foot_res: "Recursos", foot_pol: "Políticas",
  res_items: ["Catálogo", "Buscador IA", "Visual Part ID", "Búsqueda VIN", "Nosotros", "Contacto"],
  pol_items: ["Política de Envío", "Política de Devolución", "Términos de Servicio", "Privacidad"],
  foot_rights: "Todos los derechos reservados.",
  foot_operated: "partsnow.ai es operado por Post Equipment, Inc.",
  foot_secured: "Asegurado por Stripe",
  chat_title: "PartsNow IA", chat_status: "Asistente de partes · EN / ES",
  chat_help: "¿Cómo te ayudo a encontrar una parte?",
  chat_input: "Pregunta por cualquier parte de camión…",
  chat_sugg: ["Necesito tambores de freno para un Peterbilt 579", "Filtros de aceite para un Kenworth T680", "Pega un VIN"],
  chat_reply: "Aquí tienes 2 partes que encajan. Ambas en stock en Knoxville y con envío nacional.",
  chat_reply_photo: "Listo — analizando la foto. Por la carcasa, aquí van 2 coincidencias probables en stock.",
  chat_vendor: "Dealer",
};

type Lang = "en" | "es";
type SearchMode = "describe" | "vin" | "photo";

// ─── Chat types ───────────────────────────────────────────────────────────────

interface PartData {
  sku: string; title: string; vendor: string; price: number; bg: string;
}

const PARTS: PartData[] = [
  { sku: "STE-BD-0429", title: 'Brake Drum 16.5" x 7"', vendor: "Post Onsite", price: 218.40, bg: "radial-gradient(circle at 50% 45%, #64748b, #334155)" },
  { sku: "PAI-BD-9045", title: 'Drum, Outboard 16.5" x 8-5/8"', vendor: "PAI Industries", price: 264.10, bg: "radial-gradient(circle at 40% 40%, #9aa4b2, #4b5563)" },
];

type ChatMsg =
  | { r: "u"; c: string }
  | { r: "u"; k: "photo"; c: "" }
  | { r: "a"; c: string }
  | { r: "a"; k: "parts"; c: PartData[] };

// ─── Main component ───────────────────────────────────────────────────────────

export function LandingPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSeed, setChatSeed] = useState("");
  const [chatMode, setChatMode] = useState<SearchMode>("describe");
  const [chatNonce, setChatNonce] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("pn_lang") as Lang | null;
    if (saved === "en" || saved === "es") setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("pn_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = lang === "en" ? EN : ES;

  const ask = useCallback((seed = "", mode: SearchMode = "describe") => {
    setChatSeed(seed);
    setChatMode(mode);
    setChatNonce((n) => n + 1);
    setChatOpen(true);
  }, []);

  return (
    <div className="pn-lp">
      <LPNav t={t} lang={lang} setLang={setLang} onAsk={ask} />
      <main>
        <LPHero t={t} onAsk={ask} />
        <LPWays t={t} onAsk={ask} />
        <LPHow t={t} />
        <LPCategories t={t} />
        <LPFaq t={t} />
        <LPFinalCTA t={t} onAsk={ask} />
      </main>
      <LPFooter t={t} />
      <button className="lp-launcher" onClick={() => ask()} aria-label="Open AI assistant">
        <Sparkles size={24} />
      </button>
      <LPChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        t={t}
        seed={chatSeed}
        mode={chatMode}
        nonce={chatNonce}
      />
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function LPNav({ t, lang, setLang, onAsk }: { t: Copy; lang: Lang; setLang: (l: Lang) => void; onAsk: (seed?: string, mode?: SearchMode) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { key: "nav_ways", href: "#ways" },
    { key: "nav_how", href: "#how" },
    { key: "nav_cats", href: "#categories" },
    { key: "nav_faq", href: "#faq" },
  ] as const;

  return (
    <header className="lp-header">
      <div className="lp-announce">
        <MapPin size={13} />
        <span>{t.announce}</span>
      </div>
      <div className="lp-nav">
        <a href="#top" className="lp-nav-logo">
          <Image src="/logo.svg" alt="partsnow.ai" width={120} height={30} />
        </a>

        <nav className="lp-nav-links">
          {links.map((l) => (
            <a key={l.key} href={l.href} className="lp-nav-link">{t[l.key]}</a>
          ))}
        </nav>

        <div className="lp-nav-right">
          <div className="lp-lang" role="group" aria-label="Language">
            <button className={"lp-lang-btn" + (lang === "en" ? " is-on" : "")} onClick={() => setLang("en")}>EN</button>
            <button className={"lp-lang-btn" + (lang === "es" ? " is-on" : "")} onClick={() => setLang("es")}>ES</button>
          </div>
          <button className="lp-btn lp-btn-primary lp-nav-cta" onClick={() => onAsk()}>
            <Sparkles size={16} />
            <span>{t.nav_cta}</span>
          </button>
          <button className="lp-burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lp-mobile-menu">
          {links.map((l) => (
            <a key={l.key} href={l.href} className="lp-mobile-link" onClick={() => setMenuOpen(false)}>{t[l.key]}</a>
          ))}
          <button
            className="lp-btn lp-btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            onClick={() => { setMenuOpen(false); onAsk(); }}
          >
            <Sparkles size={16} />
            <span>{t.nav_cta}</span>
          </button>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function LPHero({ t, onAsk }: { t: Copy; onAsk: (seed?: string, mode?: SearchMode) => void }) {
  const [mode, setMode] = useState<SearchMode>("describe");
  const [val, setVal] = useState("");

  const modes: { id: SearchMode; label: string; icon: React.ReactNode }[] = [
    { id: "describe", label: t.mode_describe, icon: <MessageSquare size={15} /> },
    { id: "vin", label: t.mode_vin, icon: <ScanLine size={15} /> },
    { id: "photo", label: t.mode_photo, icon: <Camera size={15} /> },
  ];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const seed = val.trim() || (mode === "vin" ? "1XKAD49X9KJ123456" : mode === "photo" ? "" : t.ph_describe.replace("…", ""));
    onAsk(seed, mode);
  }

  return (
    <section className="lp-hero" id="top">
      <div className="lp-hero-bg" />
      <div className="lp-hero-inner">
        <div className="lp-hero-copy">
          <span className="lp-eyebrow lp-hero-eyebrow">{t.hero_eyebrow}</span>
          <h1 className="lp-hero-title">
            <span>{t.hero_title_1}</span>{" "}
            <span className="lp-hero-accent">{t.hero_title_2}</span>
          </h1>
          <p className="lp-hero-sub">{t.hero_sub}</p>

          <form className="lp-search" onSubmit={submit}>
            <div className="lp-search-tabs">
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={"lp-tab" + (mode === m.id ? " is-on" : "")}
                  onClick={() => setMode(m.id)}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
            <div className="lp-search-row">
              {mode === "photo" ? (
                <div className="lp-search-photo">
                  <ImageUp size={20} />
                  <span>{t.ph_photo}</span>
                </div>
              ) : (
                <div className="lp-search-field">
                  {mode === "vin" ? <ScanLine size={18} className="lp-search-ic" /> : <Search size={18} className="lp-search-ic" />}
                  <input
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    placeholder={mode === "vin" ? t.ph_vin : t.ph_describe}
                    className={mode === "vin" ? "lp-mono" : ""}
                  />
                </div>
              )}
              <button type="submit" className="lp-btn lp-btn-primary lp-search-btn">
                {mode === "photo" ? <Upload size={16} /> : <Sparkles size={16} />}
                <span>{mode === "photo" ? t.hero_btn_photo : t.hero_btn}</span>
              </button>
            </div>
          </form>

          <div className="lp-hero-stats">
            <div className="lp-stat"><span className="lp-stat-val">50,000+</span><span className="lp-stat-lbl">{t.stat_parts}</span></div>
            <div className="lp-stat"><span className="lp-stat-val">93</span><span className="lp-stat-lbl">{t.stat_dealers}</span></div>
            <div className="lp-stat"><span className="lp-stat-val">{t.stat_ai_val}</span><span className="lp-stat-lbl">{t.stat_ai}</span></div>
            <div className="lp-stat"><span className="lp-stat-val">{t.stat_lang_val}</span><span className="lp-stat-lbl">{t.stat_lang}</span></div>
          </div>
        </div>

        <div className="lp-hero-preview">
          <div className="lp-pv-card">
            <div className="lp-pv-head">
              <div className="lp-pv-avatar"><Sparkles size={16} /></div>
              <div className="lp-pv-meta">
                <span className="lp-pv-name">{t.pv_title}</span>
                <span className="lp-pv-status"><span className="lp-dot" />{t.pv_status}</span>
              </div>
            </div>
            <div className="lp-pv-body">
              <div className="lp-pv-msg lp-pv-user">{t.pv_u1}</div>
              <div className="lp-pv-msg lp-pv-ai">{t.pv_a1}</div>
              {PARTS.map((p) => (
                <div key={p.sku} className="lp-pv-part">
                  <div className="lp-pv-thumb" style={{ background: p.bg }} />
                  <div className="lp-pv-part-info">
                    <span className="lp-sku">{p.sku}</span>
                    <span className="lp-pv-part-title">{p.title}</span>
                    <span className="lp-pv-part-vendor">
                      {p.vendor} · <span className="lp-instock"><span className="lp-dot lp-dot-sm" />{t.in_stock}</span>
                    </span>
                  </div>
                  <span className="lp-pv-price">${p.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <button className="lp-pv-open" onClick={() => onAsk("", "describe")}>{t.pv_open}</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Ways ─────────────────────────────────────────────────────────────────────

function LPWays({ t, onAsk }: { t: Copy; onAsk: (seed?: string, mode?: SearchMode) => void }) {
  const ways: { title: string; desc: string; icon: React.ReactNode; mode: SearchMode }[] = [
    { title: t.way1_t, desc: t.way1_d, icon: <MessageSquare size={26} />, mode: "describe" },
    { title: t.way2_t, desc: t.way2_d, icon: <ScanSearch size={26} />, mode: "photo" },
    { title: t.way3_t, desc: t.way3_d, icon: <ScanLine size={26} />, mode: "vin" },
  ];
  return (
    <section className="lp-section" id="ways">
      <div className="lp-container">
        <div className="lp-sec-head">
          <span className="lp-eyebrow">{t.ways_eyebrow}</span>
          <h2 className="lp-sec-title">{t.ways_title}</h2>
          <p className="lp-sec-sub">{t.ways_sub}</p>
        </div>
        <div className="lp-ways-grid">
          {ways.map((w) => (
            <button key={w.title} className="lp-way-card" onClick={() => onAsk("", w.mode)}>
              <div className="lp-way-ic">{w.icon}</div>
              <h3 className="lp-way-title">{w.title}</h3>
              <p className="lp-way-desc">{w.desc}</p>
              <span className="lp-way-cta">{t.way_cta} <ArrowRight size={15} /></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

function LPHow({ t }: { t: Copy }) {
  const steps = [
    { n: "01", title: t.how1_t, desc: t.how1_d, icon: <MessageSquare size={26} />, cls: "lp-ic-primary" },
    { n: "02", title: t.how2_t, desc: t.how2_d, icon: <ListChecks size={26} />, cls: "lp-ic-accent" },
    { n: "03", title: t.how3_t, desc: t.how3_d, icon: <Truck size={26} />, cls: "lp-ic-success" },
  ];
  return (
    <section className="lp-section lp-section-alt" id="how">
      <div className="lp-container">
        <div className="lp-sec-head">
          <span className="lp-eyebrow">{t.how_eyebrow}</span>
          <h2 className="lp-sec-title">{t.how_title}</h2>
        </div>
        <div className="lp-how-grid">
          {steps.map((s) => (
            <div key={s.n} className="lp-how-step">
              <div className="lp-how-top">
                <div className={"lp-how-ic " + s.cls}>{s.icon}</div>
                <span className="lp-how-num">{s.n}</span>
              </div>
              <h3 className="lp-how-title">{s.title}</h3>
              <p className="lp-how-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────

function LPCategories({ t }: { t: Copy }) {
  const cats: { key: keyof Pick<Copy, "cat_brakes"|"cat_air"|"cat_elec"|"cat_engine"|"cat_filt"|"cat_trailer"|"cat_drive"|"cat_hyd">; icon: React.ReactNode }[] = [
    { key: "cat_brakes", icon: <Disc size={22} /> },
    { key: "cat_air", icon: <Wind size={22} /> },
    { key: "cat_elec", icon: <Lightbulb size={22} /> },
    { key: "cat_engine", icon: <Cog size={22} /> },
    { key: "cat_filt", icon: <Filter size={22} /> },
    { key: "cat_trailer", icon: <Truck size={22} /> },
    { key: "cat_drive", icon: <GitCommitHorizontal size={22} /> },
    { key: "cat_hyd", icon: <Droplets size={22} /> },
  ];
  return (
    <section className="lp-section" id="categories">
      <div className="lp-container">
        <div className="lp-sec-head lp-sec-head-row">
          <div>
            <span className="lp-eyebrow">{t.cat_eyebrow}</span>
            <h2 className="lp-sec-title">{t.cat_title}</h2>
          </div>
          <a href="https://partsnow.ai/products" className="lp-link-arrow">{t.cat_all}</a>
        </div>
        <div className="lp-cat-grid">
          {cats.map((c) => (
            <a key={c.key} href={`https://partsnow.ai/products?type=${encodeURIComponent(t[c.key])}`} className="lp-cat-tile">
              <div className="lp-cat-ic">{c.icon}</div>
              <span className="lp-cat-name">{t[c.key]}</span>
              <ArrowRight size={16} className="lp-cat-arrow" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function LPFaq({ t }: { t: Copy }) {
  const [open, setOpen] = useState<number>(0);
  return (
    <section className="lp-section lp-section-alt" id="faq">
      <div className="lp-container lp-faq-wrap">
        <div className="lp-sec-head">
          <span className="lp-eyebrow">{t.faq_eyebrow}</span>
          <h2 className="lp-sec-title">{t.faq_title}</h2>
        </div>
        <div className="lp-faq-list">
          {t.faq.map((row, i) => (
            <div key={i} className={"lp-faq-item" + (open === i ? " is-open" : "")}>
              <button className="lp-faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{row[0]}</span>
                <span className="lp-faq-toggle">
                  {open === i ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>
              <div className="lp-faq-a"><p>{row[1]}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function LPFinalCTA({ t, onAsk }: { t: Copy; onAsk: (seed?: string, mode?: SearchMode) => void }) {
  return (
    <section className="lp-finalcta">
      <div className="lp-finalcta-bg" />
      <div className="lp-container lp-finalcta-inner">
        <span className="lp-eyebrow lp-eyebrow-light">{t.cta_eyebrow}</span>
        <h2 className="lp-finalcta-title">{t.cta_title}</h2>
        <p className="lp-finalcta-sub">{t.cta_sub}</p>
        <div className="lp-finalcta-actions">
          <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => onAsk("", "describe")}>
            <Sparkles size={18} />
            <span>{t.cta_btn}</span>
          </button>
          <a className="lp-btn lp-btn-ghost lp-btn-lg" href="tel:8654864003">
            <Phone size={17} />
            <span>{t.cta_call}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function LPFooter({ t }: { t: Copy }) {
  const year = new Date().getFullYear();
  const cats: (keyof Pick<Copy, "cat_brakes"|"cat_air"|"cat_engine"|"cat_filt"|"cat_trailer"|"cat_drive">)[] =
    ["cat_brakes", "cat_air", "cat_engine", "cat_filt", "cat_trailer", "cat_drive"];
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer-grid">
        <div className="lp-footer-brand">
          <Image src="/logo-white.svg" alt="partsnow.ai" width={120} height={28} className="lp-footer-logo" />
          <p className="lp-footer-blurb">{t.foot_blurb}</p>
          <div className="lp-footer-contact">
            <div><Phone size={14} className="lp-fic" /><span>{t.phone_en}</span></div>
            <div><Phone size={14} className="lp-fic" /><span>{t.phone_es}</span></div>
            <div><Mail size={14} className="lp-fic" /><span>support@partsnow.ai</span></div>
            <div className="lp-footer-addr"><MapPin size={14} className="lp-fic" /><span>2607 Middlebrook Pike<br />Knoxville, TN 37921</span></div>
          </div>
        </div>
        <div className="lp-footer-col">
          <h4 className="lp-footer-h">{t.foot_cats}</h4>
          <ul>{cats.map((k) => <li key={k}><a href="#categories">{t[k]}</a></li>)}</ul>
        </div>
        <div className="lp-footer-col">
          <h4 className="lp-footer-h">{t.foot_res}</h4>
          <ul>{t.res_items.map((item) => <li key={item}><a href="https://partsnow.ai/products">{item}</a></li>)}</ul>
        </div>
        <div className="lp-footer-col">
          <h4 className="lp-footer-h">{t.foot_pol}</h4>
          <ul>{t.pol_items.map((item) => <li key={item}><a href="#top">{item}</a></li>)}</ul>
        </div>
      </div>
      <div className="lp-container lp-footer-bottom">
        <div>
          <div className="lp-footer-copy">© {year} partsnow.ai. {t.foot_rights}</div>
          <div className="lp-footer-legal">{t.foot_operated}</div>
        </div>
        <div className="lp-footer-pay">
          <div className="lp-pay-row">
            {["VISA", "MC", "AMEX", "DISCOVER"].map((c) => <span key={c} className="lp-pay">{c}</span>)}
          </div>
          <span className="lp-footer-sep">|</span>
          <span className="lp-footer-secured">{t.foot_secured}</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Chat drawer ──────────────────────────────────────────────────────────────

function LPChat({
  open, onClose, t, seed, mode, nonce,
}: {
  open: boolean; onClose: () => void; t: Copy;
  seed: string; mode: SearchMode; nonce: number;
}) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushReply(photo: boolean) {
    setTyping(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [
        ...m,
        { r: "a", c: photo ? t.chat_reply_photo : t.chat_reply },
        { r: "a", k: "parts", c: PARTS },
      ]);
    }, 950);
  }

  const send = useCallback((text?: string) => {
    const txt = (text ?? input).trim();
    if (!txt) return;
    setInput("");
    setMsgs((m) => [...m, { r: "u", c: txt }]);
    pushReply(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, t]);

  function sendPhoto() {
    setMsgs((m) => [...m, { r: "u", k: "photo", c: "" }]);
    pushReply(true);
  }

  useEffect(() => {
    if (!open || !nonce) return;
    if (mode === "photo" && !seed) { sendPhoto(); return; }
    if (seed) { send(seed); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, typing]);

  if (!open) return null;
  return (
    <div className="lp-chat-overlay">
      <div className="lp-chat-scrim" onClick={onClose} />
      <aside className="lp-chat">
        <div className="lp-chat-head">
          <div className="lp-chat-avatar"><Sparkles size={18} /></div>
          <div className="lp-chat-meta">
            <span className="lp-chat-name">{t.chat_title}</span>
            <span className="lp-chat-status">{t.chat_status}</span>
          </div>
          <button className="lp-chat-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="lp-chat-body" ref={bodyRef}>
          {msgs.length === 0 && !typing && (
            <div className="lp-chat-empty">
              <p>{t.chat_help}</p>
              <div className="lp-chat-sugg">
                {t.chat_sugg.map((s) => (
                  <button key={s} onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m, i) => {
            if ("k" in m && m.k === "parts") {
              return (
                <div key={i} className="lp-chat-parts">
                  {(m.c as PartData[]).map((p) => (
                    <div key={p.sku} className="lp-chat-part">
                      <div className="lp-chat-part-thumb" style={{ background: p.bg }} />
                      <div className="lp-chat-part-info">
                        <span className="lp-sku">{p.sku}<span className="lp-dot lp-dot-sm" /></span>
                        <span className="lp-chat-part-title">{p.title}</span>
                        <span className="lp-chat-part-vendor">{p.vendor}</span>
                      </div>
                      <span className="lp-chat-part-price">${p.price.toFixed(2)}</span>
                      <ArrowRight size={14} style={{ color: "var(--muted)" }} />
                    </div>
                  ))}
                </div>
              );
            }
            if ("k" in m && m.k === "photo") {
              return (
                <div key={i} className="lp-chat-line lp-chat-line-user">
                  <div className="lp-chat-bubble lp-chat-bubble-user" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ImageIcon size={16} />
                    <span>part-photo.jpg</span>
                  </div>
                </div>
              );
            }
            const user = m.r === "u";
            return (
              <div key={i} className={"lp-chat-line" + (user ? " lp-chat-line-user" : "")}>
                {!user && <div className="lp-chat-aiav"><Sparkles size={12} /></div>}
                <div className={"lp-chat-bubble" + (user ? " lp-chat-bubble-user" : " lp-chat-bubble-ai")}>{m.c}</div>
              </div>
            );
          })}

          {typing && (
            <div className="lp-chat-line">
              <div className="lp-chat-aiav"><Sparkles size={12} /></div>
              <div className="lp-chat-bubble lp-chat-bubble-ai lp-chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        <form className="lp-chat-input-bar" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.chat_input} />
          <button type="submit" aria-label="Send"><Send size={16} /></button>
        </form>
      </aside>
    </div>
  );
}
