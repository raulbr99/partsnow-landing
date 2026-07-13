"use client";

import { Sparkles } from "lucide-react";
import { openMikeChat } from "@/components/MikeChat";
import { askMikePrompt } from "@/lib/trucks-data";

// Client island: opens the site-wide Mike chat pre-seeded with a question
// about this specific truck. `message` overrides the default diagnosis seed.
export function AskMikeButton({
  make,
  model,
  label,
  message,
  className,
}: {
  make: string;
  model: string;
  label: string;
  message?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => openMikeChat(message ?? askMikePrompt(make, model))}
      className={
        className ??
        "flex-1 inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-light text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors"
      }
    >
      <Sparkles className="w-4 h-4" /> {label}
    </button>
  );
}
