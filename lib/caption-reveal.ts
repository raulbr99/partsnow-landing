/** Reveal caption word-by-word (approximate sync with TTS). Returns stop handle. */
export function startWordReveal(
  text: string,
  onUpdate: (visible: string) => void,
  shouldAbort: () => boolean,
  wordMs = 300,
  onComplete?: () => void,
): () => void {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    onUpdate(text);
    onComplete?.();
    return () => {};
  }

  let i = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const step = () => {
    if (shouldAbort()) return;
    i += 1;
    onUpdate(words.slice(0, i).join(" "));
    if (i < words.length) {
      timer = setTimeout(step, wordMs);
    } else {
      onComplete?.();
    }
  };

  step();

  return () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
}
