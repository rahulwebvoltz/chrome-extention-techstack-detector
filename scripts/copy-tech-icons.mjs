// Copies upstream technology icons used by the active GPL pack from
// vendor/webappanalyzer/icons into public/tech-icons/ (Vite copies public/
// into dist/). Run by scripts/build.mjs for pack builds only.
//
// - SVGs are lightly minified (comments, metadata, inter-tag whitespace).
// - Icons over MAX_BYTES after minifying are skipped — a handful of upstream
//   SVGs embed multi-MB bitmaps; those technologies fall back to a letter tile.
// - Icons are displayed with <img>, so scripts inside an SVG can never run.
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import packRules from "../src/detector/packs/wappalyzer.generated.js";

const MAX_BYTES = 50_000;
const SRC = resolve(import.meta.dirname, "../vendor/webappanalyzer/icons");
const OUT = resolve(import.meta.dirname, "../public/tech-icons");
const OPTIMIZED = resolve(import.meta.dirname, "../vendor/webappanalyzer/icons-optimized");

if (!existsSync(SRC)) {
  console.warn("tech icons: vendor/webappanalyzer/icons missing — run `npm run pack:fetch`. Skipping.");
  process.exit(0);
}

const minifySvg = (svg) =>
  svg
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<metadata[\s\S]*?<\/metadata>/gi, "")
    .replace(/>\s+</g, "><")
    .trim();

rmSync(OUT, { recursive: true, force: true });
mkdirSync(resolve(OUT, "optimized"), { recursive: true });

const files = [...new Set(packRules.map((r) => r.iconFile).filter(Boolean))];
let copied = 0;
let skipped = 0;
let bytes = 0;
for (const file of files) {
  // "optimized/<name>.png" → pre-rendered small PNG of an oversized icon
  const isOptimized = file.startsWith("optimized/");
  const base = isOptimized ? OPTIMIZED : SRC;
  const from = resolve(base, isOptimized ? file.slice("optimized/".length) : file);
  // Guard against path tricks in upstream data
  if (!from.startsWith(base) || !existsSync(from)) {
    skipped++;
    continue;
  }
  if (file.toLowerCase().endsWith(".svg")) {
    const svg = minifySvg(readFileSync(from, "utf8"));
    if (svg.length > MAX_BYTES) {
      skipped++;
      continue;
    }
    writeFileSync(resolve(OUT, file), svg);
    bytes += svg.length;
  } else {
    const size = readFileSync(from).length;
    if (size > MAX_BYTES) {
      skipped++;
      continue;
    }
    copyFileSync(from, resolve(OUT, file));
    bytes += size;
  }
  copied++;
}
console.log(`tech icons: ${copied} upstream icons copied (${(bytes / 1e6).toFixed(1)} MB), ${skipped} skipped`);
