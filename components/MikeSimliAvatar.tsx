"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useHeroSliderSlideIndex } from "@/lib/hero-slider-context";
import type { SiteLocale } from "@/lib/use-browser-locale";
import { startWordReveal } from "@/lib/caption-reveal";
import { loadSimliClient, speakViaTts, stripForSpeech, type SimliClientLike } from "@/lib/simli-speak";

type HistoryMsg = { role: "user" | "assistant"; content: string };

export type MikeSimliHandle = {
  isActive: () => boolean;
  isReady: () => boolean;
  isThinking: () => boolean;
  isSpeaking: () => boolean;
  ask: (question: string) => Promise<void>;
  activate: () => Promise<void>;
  /** Stop current speech; keeps session open. */
  interrupt: () => void;
  stop: () => Promise<void>;
};

type Props = {
  locale: SiteLocale;
  posterSrc: string;
  posterAlt?: string;
  frameClassName?: string;
  greeting?: string;
  /** meet = full widget (#meet). hero = avatar frame only, parent drives chat input. */
  variant?: "meet" | "hero";
  posterWidth?: number;
  posterHeight?: number;
  /** Hero only: Mike session connecting or live — parent can pause the slider. */
  onEngagedChange?: (engaged: boolean) => void;
};

export const MikeSimliAvatar = forwardRef<MikeSimliHandle, Props>(function MikeSimliAvatar(
  {
    locale,
    posterSrc,
    posterAlt = "Mike",
    frameClassName = "steve-portrait mike-simli",
    greeting = "Hey — I'm Mike. Tell me what's going on with the truck.",
    variant = "meet",
    posterWidth = 340,
    posterHeight = 340,
    onEngagedChange,
  },
  ref,
) {
  const isHero = variant === "hero";
  const slideIndex = useHeroSliderSlideIndex();

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const clientRef = useRef<SimliClientLike | null>(null);
  const historyRef = useRef<HistoryMsg[]>([]);
  const speakGenRef = useRef(0);
  const stopRevealRef = useRef<(() => void) | null>(null);
  const meetInputRef = useRef<HTMLInputElement>(null);
  const statusElRef = useRef<HTMLParagraphElement>(null);

  const [active, setActive] = useState(false);
  const [textOnly, setTextOnly] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [input, setInput] = useState("");
  const [showPoster, setShowPoster] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const language = locale === "es" ? "es" : "en";
  const ready = active || textOnly;

  const setStatusText = useCallback((text: string | null) => {
    const el = statusElRef.current;
    if (!el) return;
    if (text) {
      el.textContent = text;
      el.hidden = false;
    } else {
      el.textContent = "";
      el.hidden = true;
    }
  }, []);

  const focusMeetInput = useCallback(() => {
    if (isHero) return;
    requestAnimationFrame(() => meetInputRef.current?.focus());
  }, [isHero]);

  const stopReveal = useCallback(() => {
    stopRevealRef.current?.();
    stopRevealRef.current = null;
  }, []);

  const cancelSpeech = useCallback(() => {
    speakGenRef.current += 1;
    stopReveal();
    clientRef.current?.ClearBuffer();
    setSpeaking(false);
  }, [stopReveal]);

  const interruptSpeech = useCallback(() => {
    cancelSpeech();
    setStatusText(null);
  }, [cancelSpeech, setStatusText]);

  const runSpeech = useCallback(
    (text: string) => {
      const client = clientRef.current;
      if (!client || textOnly) return Promise.resolve();
      const gen = speakGenRef.current;
      return speakViaTts(client, stripForSpeech(text), language, () => gen !== speakGenRef.current).catch(
        () => undefined,
      );
    },
    [language, textOnly],
  );

  const speakReply = useCallback(
    (text: string) => {
      const clean = stripForSpeech(text);
      if (!clean) return;

      if (textOnly) {
        setStatusText(clean);
        return;
      }

      const gen = speakGenRef.current;
      let ttsDone = false;
      let captionDone = false;
      const maybeFinishSpeaking = () => {
        if (gen !== speakGenRef.current) return;
        if (ttsDone && captionDone) setSpeaking(false);
      };

      setSpeaking(true);
      stopReveal();
      stopRevealRef.current = startWordReveal(
        clean,
        setStatusText,
        () => gen !== speakGenRef.current,
        300,
        () => {
          captionDone = true;
          maybeFinishSpeaking();
        },
      );
      void runSpeech(clean).finally(() => {
        ttsDone = true;
        maybeFinishSpeaking();
      });
    },
    [runSpeech, setStatusText, stopReveal, textOnly],
  );

  const stopSession = useCallback(async () => {
    cancelSpeech();
    setActive(false);
    setTextOnly(false);
    setConnecting(false);
    setThinking(false);
    try {
      await clientRef.current?.stop();
    } catch {
      /* ignore */
    }
    clientRef.current = null;
    setShowPoster(true);
    setStatusText(null);
  }, [cancelSpeech]);

  const enterTextOnly = useCallback((msg: string) => {
    setTextOnly(true);
    setShowPoster(true);
    setStatusText(`${msg} You can still chat in text.`);
  }, []);

  const activate = useCallback(async () => {
    if (active || connecting || thinking) return;
    setConnecting(true);
    setStatusText(isHero ? null : "Connecting…");

    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) {
      setConnecting(false);
      return;
    }

    setShowPoster(false);
    void video.play().catch(() => undefined);
    void audio.play().catch(() => undefined);

    try {
      const tokenRes = await fetch("/api/simli-token", { method: "POST" });
      if (tokenRes.status === 503) {
        enterTextOnly("Avatar isn't configured.");
        return;
      }
      if (tokenRes.status === 429) {
        enterTextOnly("Avatar is busy.");
        return;
      }
      if (!tokenRes.ok) {
        enterTextOnly("Couldn't start avatar.");
        return;
      }

      const { session_token: token } = (await tokenRes.json()) as { session_token?: string };
      if (!token) {
        enterTextOnly("Couldn't start avatar.");
        return;
      }

      const { SimliClient, LogLevel } = await loadSimliClient();
      const client = new SimliClient(token, video, audio, null, LogLevel.INFO, "livekit") as SimliClientLike;
      clientRef.current = client;

      await Promise.race([
        client.start(),
        new Promise<void>((_, rej) => setTimeout(() => rej(new Error("timeout")), 20_000)),
      ]);

      setActive(true);
      setTextOnly(false);
      cancelSpeech();
      speakReply(greeting);
    } catch {
      await stopSession();
      enterTextOnly("Couldn't start avatar.");
    } finally {
      setConnecting(false);
    }
  }, [
    active,
    cancelSpeech,
    connecting,
    enterTextOnly,
    greeting,
    isHero,
    speakReply,
    stopSession,
    thinking,
  ]);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || thinking) return;
      if (!ready) {
        setStatusText(isHero ? 'Click Mike\'s photo first, then send.' : 'Click "Talk to Mike" first.');
        return;
      }

      cancelSpeech();
      setThinking(true);
      setInput("");
      focusMeetInput();
      historyRef.current.push({ role: "user", content: q });
      setStatusText("Mike is thinking…");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyRef.current }),
        });
        const data = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok) {
          historyRef.current.pop();
          setStatusText(
            res.status === 500 && data.error === "API not configured"
              ? "Chat API not configured locally — run vercel env pull."
              : "Couldn't reach Mike. Try again.",
          );
          return;
        }
        const reply: string = data.reply?.trim() || "Sorry — try again or call (865) 290-5485.";
        historyRef.current.push({ role: "assistant", content: reply });
        speakReply(reply);
      } catch {
        historyRef.current.pop();
        setStatusText("Couldn't reach Mike. Try again.");
      } finally {
        setThinking(false);
        focusMeetInput();
      }
    },
    [cancelSpeech, focusMeetInput, isHero, ready, speakReply, thinking],
  );

  useImperativeHandle(
    ref,
    () => ({
      isActive: () => active,
      isReady: () => ready,
      isThinking: () => thinking,
      isSpeaking: () => speaking,
      ask,
      activate,
      interrupt: interruptSpeech,
      stop: stopSession,
    }),
    [active, activate, ask, interruptSpeech, ready, speaking, stopSession, thinking],
  );

  useEffect(() => {
    if (!isHero && ready) focusMeetInput();
  }, [focusMeetInput, isHero, ready]);

  useEffect(() => {
    if (!isHero) return;
    onEngagedChange?.(connecting || ready);
  }, [connecting, isHero, onEngagedChange, ready]);

  useEffect(() => {
    if (!isHero) return;
    return () => onEngagedChange?.(false);
  }, [isHero, onEngagedChange]);

  useEffect(() => {
    if (isHero && slideIndex !== 0 && active) void stopSession();
  }, [active, isHero, slideIndex, stopSession]);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    const onVis = () => {
      if (hideTimer) clearTimeout(hideTimer);
      if (!document.hidden || !active) return;
      hideTimer = setTimeout(() => {
        if (document.hidden && active) void stopSession();
      }, 30_000);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [active, stopSession]);

  const onFrameClick = () => {
    if (isHero && !ready && !connecting) void activate();
  };

  return (
    <div className={`mike-simli-wrap${isHero ? " mike-simli-wrap--hero" : ""}`}>
      <div
        className={`${frameClassName}${connecting ? " is-connecting" : ""}${isHero && !ready ? " is-clickable" : ""}`}
        onClick={onFrameClick}
        onKeyDown={(e) => {
          if (isHero && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onFrameClick();
          }
        }}
        role={isHero && !ready ? "button" : undefined}
        tabIndex={isHero && !ready ? 0 : undefined}
        aria-label={isHero && !ready ? "Talk to Mike" : undefined}
      >
        {showPoster && (
          <Image
            className={isHero ? "sa-photo" : "portrait-photo"}
            src={posterSrc}
            alt={posterAlt}
            width={posterWidth}
            height={posterHeight}
            priority={!isHero}
          />
        )}
        <video
          ref={videoRef}
          className="mike-simli-video"
          playsInline
          style={{ opacity: showPoster ? 0 : 1 }}
        />
        <audio ref={audioRef} hidden />
        {isHero && showPoster && (
          <>
            <span className="sa-spark" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8z" />
              </svg>
            </span>
            <span className="sa-live" aria-hidden />
          </>
        )}
        {!isHero && (
          <div className="online">
            <span className="dot" />
            Online now
          </div>
        )}
        {connecting && isHero && (
          <span className="mike-simli-connecting" aria-live="polite">
            Connecting…
          </span>
        )}
      </div>

      {isHero && active && (
        <div className="mike-simli-actions mike-simli-actions--hero">
          {speaking && (
            <button type="button" className="mike-simli-chip mike-simli-chip--stop" onClick={interruptSpeech}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="7" y="7" width="10" height="10" rx="2" />
              </svg>
              {locale === "es" ? "Parar" : "Stop"}
            </button>
          )}
          <button type="button" className="mike-simli-chip mike-simli-chip--end" onClick={() => void stopSession()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            {locale === "es" ? "Cerrar" : "End"}
          </button>
        </div>
      )}

      {!isHero && !ready && (
        <button
          type="button"
          className="btn btn-chat mike-simli-activate"
          onClick={() => void activate()}
          disabled={connecting}
        >
          {connecting ? "Connecting…" : "Talk to Mike"}
        </button>
      )}

      {!isHero && ready && (
        <>
          <form
            className="mike-simli-form"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(input);
            }}
          >
            <input
              ref={meetInputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={locale === "es" ? "Cuéntale a Mike qué pasa…" : "Tell Mike what's going on…"}
            />
            <button type="submit" disabled={thinking || !input.trim()}>
              Send
            </button>
          </form>
          {active && (
            <div className="mike-simli-actions mike-simli-actions--meet">
              {speaking && (
                <button type="button" className="mike-simli-chip mike-simli-chip--stop" onClick={interruptSpeech}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <rect x="7" y="7" width="10" height="10" rx="2" />
                  </svg>
                  {locale === "es" ? "Parar" : "Stop"}
                </button>
              )}
              <button type="button" className="mike-simli-chip mike-simli-chip--end" onClick={() => void stopSession()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
                {locale === "es" ? "Cerrar" : "End"}
              </button>
            </div>
          )}
        </>
      )}

      <p
        ref={statusElRef}
        className={`mike-simli-status${isHero ? " mike-simli-status--hero" : ""}`}
        role="status"
        hidden
      />
      {!isHero && (
        <p className="mike-simli-hint">Click to start, then type — no microphone yet.</p>
      )}
      {isHero && !ready && !connecting && (
        <p className="mike-simli-hint mike-simli-hint--hero">Click Mike, then type below.</p>
      )}
    </div>
  );
});
