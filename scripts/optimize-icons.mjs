// Shrinks oversized upstream icons (some SVGs embed multi-MB bitmaps) into
// 64×64 PNGs, rendered by a headless Edge/Chromium canvas. Output:
//   vendor/webappanalyzer/icons-optimized/<original file name>.png
// The importer points those technologies at the optimized file.
//
// Run automatically by `npm run pack:fetch`; skipped (with a warning) if no
// Edge/Chromium is installed — those few icons then fall back to letter tiles.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export const MAX_ICON_BYTES = 50_000;
const SIZE = 64;
const SRC = resolve(import.meta.dirname, "../vendor/webappanalyzer/icons");
const OUT = resolve(import.meta.dirname, "../vendor/webappanalyzer/icons-optimized");
const BROWSERS = [
  process.env.BROWSER,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/microsoft-edge",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
].filter(Boolean);

const browserPath = BROWSERS.find((p) => existsSync(p));
if (!browserPath) {
  console.warn("optimize-icons: no Edge/Chromium found (set BROWSER=…); oversized icons will use letter tiles.");
  process.exit(0);
}

const oversized = readdirSync(SRC).filter((f) => statSync(join(SRC, f)).size > MAX_ICON_BYTES);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const PORT = 9850 + Math.floor(Math.random() * 100);
const profile = mkdtempSync(join(tmpdir(), "techstack-icons-"));
const browser = spawn(browserPath, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--no-first-run", "about:blank"]);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let target;
for (let i = 0; i < 40 && !target; i++) {
  await wait(250);
  try {
    target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === "page");
  } catch {
    // starting
  }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (pending.has(m.id)) pending.get(m.id)(m), pending.delete(m.id);
};
const evaluate = (expression) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, (m) => r(m.result?.result?.value ?? null));
    ws.send(JSON.stringify({ id: i, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } }));
  });

let done = 0;
for (const file of oversized) {
  const mime = file.toLowerCase().endsWith(".svg") ? "image/svg+xml" : file.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
  const dataUrl = `data:${mime};base64,${readFileSync(join(SRC, file)).toString("base64")}`;
  const png = await evaluate(`new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = c.height = ${SIZE};
      const w = img.naturalWidth || ${SIZE}, h = img.naturalHeight || ${SIZE};
      const s = Math.min(${SIZE} / w, ${SIZE} / h);
      c.getContext("2d").drawImage(img, (${SIZE} - w * s) / 2, (${SIZE} - h * s) / 2, w * s, h * s);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = ${JSON.stringify(dataUrl)};
  })`);
  if (png) {
    writeFileSync(join(OUT, `${file}.png`), Buffer.from(png.split(",")[1], "base64"));
    done++;
  }
}

ws.close();
browser.kill();
await wait(500);
rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 300 });
console.log(`optimize-icons: ${done}/${oversized.length} oversized icons rendered to ${SIZE}px PNG`);
