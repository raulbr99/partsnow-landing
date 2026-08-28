#!/usr/bin/env node
/**
 * Upload hero slide WebP assets to Vercel Blob (public URLs for any deploy).
 * Usage: node scripts/upload-hero-slides-blob.mjs
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { put } from "@vercel/blob";

const __dir = dirname(fileURLToPath(import.meta.url));
const slidesDir = join(__dir, "../public/hero-slides");

function loadToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return process.env.BLOB_READ_WRITE_TOKEN.trim();
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
      if (name !== "BLOB_READ_WRITE_TOKEN") continue;
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val) return val;
    }
  }
  throw new Error("BLOB_READ_WRITE_TOKEN not found");
}

const token = loadToken();
process.env.BLOB_READ_WRITE_TOKEN = token;

const files = readdirSync(slidesDir).filter((f) => f.endsWith(".webp")).sort();
const urls = {};

for (const file of files) {
  const data = readFileSync(join(slidesDir, file));
  const blob = await put(`hero-slides/${file}`, data, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  urls[file] = blob.url;
  console.log(`${file}\t${blob.url}`);
}

console.log("\n-- SQL updates (agent slides) --");
const map = {
  "slide-symptom.webp": 0,
  "slide-photo-part.webp": 1,
  "slide-vin.webp": 2,
  "slide-guides.webp": 3,
  "slide-encyclopedia.webp": 4,
  "slide-phone.webp": 5,
};
for (const [file, sort] of Object.entries(map)) {
  const url = urls[file];
  if (!url) continue;
  console.log(
    `UPDATE public.home_slides SET photo = '${url}' WHERE site = 'agent' AND sort_order = ${sort};`,
  );
}
