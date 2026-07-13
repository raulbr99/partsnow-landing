"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

type ChatMsg = { role: "steve" | "user"; text: string; image?: string };

type Part = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
type HistoryMsg = { role: "user" | "assistant"; content: string | Part[] };

const FALLBACK = "Got it — tell me more about the truck (make, model, year) and I'll point you in the right direction. Or call/text (865) 290-5485 and I'll help right now.";

const FOLLOWUPS = ["It's a 2020 Kenworth T680", "Gets worse when I brake", "Can I just call instead?"];

const OPEN_EVENT = "mike:open-chat";

/** Open the site-wide Mike chat from anywhere. Optionally seed a first message
 * or jump straight into the photo picker (attach). */
export function openMikeChat(message?: string, opts?: { attach?: boolean }) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { message, attach: opts?.attach } }));
}

/** Downscale a picked image to ≤1024px JPEG so requests stay light. */
async function downscaleImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

/**
 * Site-wide "Chat with Mike" widget: floating button + slide-up panel.
 * Mounted once in the root layout; any page opens it via openMikeChat()
 * (a window CustomEvent), so server-rendered pages can seed it from tiny
 * client islands like AskMikeButton.
 */
export function MikeChat() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  // Keep API-format history separately (excludes greeting)
  const historyRef = useRef<HistoryMsg[]>([]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  const send = useCallback(async (text: string, image?: string | null) => {
    const t = text.trim();
    const img = image ?? null;
    if ((!t && !img) || busy) return;
    const shown = t || "What part is this?";
    setBusy(true);
    setSuggestions([]);
    setPendingImage(null);
    setMessages((m) => [...m, { role: "user", text: shown, ...(img ? { image: img } : {}) }]);
    historyRef.current.push({
      role: "user",
      content: img
        ? [{ type: "text", text: shown }, { type: "image_url", image_url: { url: img } }]
        : shown,
    });
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

  const openChat = useCallback((seed?: string, attach?: boolean) => {
    setChatOpen(true);
    if (!opened) {
      setOpened(true);
      setMessages([{ role: "steve", text: "Hey, I'm Mike — your parts guy at PartsNow. Tell me what's going on with your truck, or what part you're chasing. No account needed, and this is free." }]);
      setSuggestions(["It's making a noise", "Warning light is on", "I have a part number"]);
    }
    if (attach) {
      // Must run synchronously so the click gesture carries into the picker.
      fileRef.current?.click();
    } else if (seed?.trim()) {
      setTimeout(() => send(seed), 360);
    }
    setTimeout(() => inputRef.current?.focus(), 280);
  }, [opened, send]);

  // Any page opens (and optionally seeds) the chat via this window event.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<{ message?: string; attach?: boolean }>).detail;
      openChat(d?.message, d?.attach);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [openChat]);

  const closeChat = () => setChatOpen(false);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setPendingImage(await downscaleImage(file));
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      // Unreadable file — ignore.
    }
  };

  const sendFromPanel = () => {
    const t = inputRef.current;
    if (t) { send(t.value, pendingImage); t.value = ""; t.style.height = "auto"; }
  };

  return (
    <>
      {/* MIKE FAB */}
      {!chatOpen && (
        <button className="steve-fab" onClick={() => openChat()}>
          <span className="fab-ava"><Image src="/steve-face.png" alt="Mike" width={38} height={38} /></span>
          <span>Chat with Mike</span>
        </button>
      )}

      {/* OVERLAY */}
      <div className={`steve-overlay${chatOpen ? " open" : ""}`} onClick={closeChat} />

      {/* MIKE PANEL */}
      <div className={`steve-panel${chatOpen ? " open" : ""}`} role="dialog" aria-label="Chat with Mike">
        <div className="sp-head">
          <div className="sp-ava"><Image src="/steve-face.png" alt="Mike" width={42} height={42} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%", borderRadius: "50%" }} /></div>
          <div className="sp-meta">
            <div className="nm">Mike</div>
            <div className="st">
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success-500)", display: "inline-block" }} />
              Online · Parts consultant
            </div>
          </div>
          <a className="sp-call" href="tel:+18652905485">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Call
          </a>
          <button className="sp-close" onClick={closeChat} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="sp-body" ref={bodyRef}>
          {messages.map((m, i) => (
            <div key={i} className={`sp-msg ${m.role}`}>
              {m.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="sp-msg-img" src={m.image} alt="Attached part photo" />
              )}
              {m.text}
            </div>
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

        {pendingImage && (
          <div className="sp-attach-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingImage} alt="Photo ready to send" />
            <span>Photo attached — add a note and hit send</span>
            <button onClick={() => setPendingImage(null)} aria-label="Remove photo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        <div className="sp-foot">
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPickFile} />
          <button className="sp-attach" onClick={() => fileRef.current?.click()} aria-label="Attach a photo" title="Send Mike a photo of the part">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.5"/></svg>
          </button>
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
                send(e.currentTarget.value, pendingImage);
                e.currentTarget.value = "";
                e.currentTarget.style.height = "auto";
              }
            }}
          />
          <button className="sp-send" disabled={busy} onClick={sendFromPanel} aria-label="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
        <div className="sp-disclaim">Mike is an AI assistant. Always confirm safety-critical repairs with a pro.</div>
      </div>
    </>
  );
}
