import { openMikeChat } from "@/components/MikeChat";

export const MIKE_SEEDS = {
  symptom:
    "My truck's making a noise it wasn't making yesterday and I'm not sure what part I need.",
  photo:
    "I've got the old part in my hand but there's no number on it. Can I send you a photo so you can identify it?",
  vin: "Can you look up the right parts using my VIN? I'll give you the number.",
  es: "Hola Mike, necesito ayuda para encontrar una pieza para mi camión. ¿Me puedes ayudar?",
} as const;

/** Agent slide CTAs: chat:* opens Mike; tel/http/path navigate normally. */
export function activateSlideHref(href: string) {
  if (href.startsWith("chat:")) {
    const action = href.slice(5);
    if (action === "photo") return openMikeChat(undefined, { attach: true });
    if (action === "symptom") return openMikeChat(MIKE_SEEDS.symptom);
    if (action === "vin") return openMikeChat(MIKE_SEEDS.vin);
    if (action === "es") return openMikeChat(MIKE_SEEDS.es);
    return openMikeChat();
  }
  window.location.assign(href);
}
