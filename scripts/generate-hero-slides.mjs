#!/usr/bin/env node
/**
 * Generate agent hero slide images via OpenRouter Image API.
 * Usage: OPENROUTER_API_KEY=... node scripts/generate-hero-slides.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dir = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dir, "../public/hero-slides");

function loadKey() {
  if (process.env.OPENROUTER_API_KEY?.trim()) return process.env.OPENROUTER_API_KEY.trim();
  if (process.env.OPENROUTER_API_KEY_ADMIN?.trim()) return process.env.OPENROUTER_API_KEY_ADMIN.trim();
  for (const p of [
    join(__dir, "../../superadmin-partsnow/.env.local"),
    join(__dir, "../.env.local"),
  ]) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const name = trimmed.slice(0, eq).trim();
      if (name !== "OPENROUTER_API_KEY" && name !== "OPENROUTER_API_KEY_ADMIN") continue;
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val) return val;
    }
  }
  throw new Error("OPENROUTER_API_KEY not found");
}

const SLIDES = [
  {
    file: "slide-symptom.webp",
    prompt:
      "A diesel mechanic in a blue work uniform and cap leaning over an open hood of a heavy-duty semi truck in a well-lit repair shop, inspecting the engine with a focused expression. Grease-stained hands, realistic industrial environment, warm shop lighting mixed with cool daylight from bay doors. Professional commercial photography, realistic, cinematic lighting, shallow depth of field, no text, no logos, no watermark.",
  },
  {
    file: "slide-photo-part.webp",
    prompt:
      "Close-up of a worn heavy-duty truck brake drum and wheel hub on a lift in a truck repair bay, a mechanic gloved hand holding a smartphone to photograph the damaged part. Sharp detail on metal wear and rust, realistic workshop background softly blurred. Professional commercial photography, realistic, cinematic lighting, no text, no logos, no watermark, no readable phone screen content.",
  },
  {
    file: "slide-vin.webp",
    prompt:
      "Close-up of a metal VIN identification plate on the lower corner of a semi truck windshield, shot from inside the cab at a slight angle, dashboard edge visible, natural daylight. Blurred unreadable characters on the plate, realistic fleet truck interior, professional automotive photography, no text, no logos, no watermark.",
  },
  {
    file: "slide-guides.webp",
    prompt:
      "A truck driver or diesel mechanic sitting in the cab of a parked semi truck at a rest stop, reading a repair checklist on a tablet, engine bay visible through the open driver door in background. Calm focused mood, golden hour light through windshield, realistic documentary style. Professional commercial photography, blank tablet screen, no text, no logos, no watermark.",
  },
  {
    file: "slide-encyclopedia.webp",
    prompt:
      "Editorial wide shot of three different heavy-duty trucks lined up in a fleet yard, red cab, white cab, and blue cab, shot at three-quarter front angle. Clean asphalt, overcast soft light, realistic North American trucking environment. Professional fleet photography, no readable brand badges, no text, no logos, no watermark.",
  },
  {
    file: "slide-phone.webp",
    prompt:
      "A truck driver in a high-visibility vest inside a semi truck cab at night, holding a phone to his ear while parked on a dark highway shoulder, dashboard lights glowing softly. Through the windshield, faint highway lights and rain on glass. Moody cinematic night photography, realistic, empathetic and calm. No readable phone screen, no text, no logos, no watermark.",
  },
  {
    file: "slide-spanish.webp",
    prompt:
      "Professional portrait of a friendly male heavy-duty truck parts specialist in his 40s, short dark hair, wearing a navy blue polo shirt, arms crossed, warm confident smile, neutral dark teal gradient studio background. Head and shoulders, clean corporate portrait style. Realistic, no text, no logos, no watermark.",
  },
];

const MODEL = process.env.OPENROUTER_IMAGE_MODEL || "google/gemini-3.1-flash-image-preview";

async function generateOne(prompt) {
  const key = loadKey();
  const res = await fetch("https://openrouter.ai/api/v1/images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://agent.partsnow.ai",
      "X-Title": "PartsNow Landing Hero Slides",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      n: 1,
      aspect_ratio: "4:3",
      resolution: "2K",
      output_format: "jpeg",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err.slice(0, 400)}`);
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image in response");
  return Buffer.from(b64, "base64");
}

mkdirSync(outDir, { recursive: true });

for (const slide of SLIDES) {
  const dest = join(outDir, slide.file);
  if (existsSync(dest) && !process.env.FORCE_REGEN) {
    console.log(`skip ${slide.file} (exists)`);
    continue;
  }
  console.log(`generating ${slide.file}...`);
  const jpeg = await generateOne(slide.prompt);
  const buf = await sharp(jpeg).webp({ quality: 82 }).toBuffer();
  writeFileSync(dest, buf);
  console.log(`  wrote ${dest} (${(buf.length / 1024).toFixed(0)} KB, from ${(jpeg.length / 1024).toFixed(0)} KB jpeg)`);
}

console.log("done");
