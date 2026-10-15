// End-to-end check against real websites.
//
// Loads dist/ as an unpacked extension in a headless browser, opens each
// site, and reads the scan result the service worker cached for that tab —
// so it exercises the real pipeline: content script, main-world probe,
// webRequest headers, chrome.cookies, rules, badge.
//
//   npm run build && npm run test:e2e            # all sites
//   npm run test:e2e -- nextjs.org vuejs.org     # just these
//
// Needs Microsoft Edge or Chromium. (Google Chrome 137+ ignores
// --load-extension, so it can't be used here.) Override with BROWSER=<path>.
// E2E_DUMP=<dir> also saves each site's full scan result as JSON.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// Expectations are kept to signals these sites have shown consistently.
// Sites change their stacks — if one fails, check the site before the rule.
const SITES = [
  { url: "https://wordpress.org/", expect: ["WordPress", "Nginx", "PHP"] },
  { url: "https://nextjs.org/", expect: ["Next.js", "React", "Vercel", "Tailwind CSS"] },
  { url: "https://vuejs.org/", expect: ["Vue.js", "Netlify"] },
  { url: "https://angular.dev/", expect: ["Angular"] },
  { url: "https://svelte.dev/", expect: ["SvelteKit", "Svelte", "Vercel"] },
  { url: "https://astro.build/", expect: ["Astro", "Tailwind CSS"] },
  { url: "https://jquery.com/", expect: ["jQuery", "WordPress"] },
  { url: "https://www.wix.com/", expect: ["Wix", "React"] },
  { url: "https://emberjs.com/", expect: ["Ember.js"] },
  { url: "https://qwik.dev/", expect: ["Qwik"] },
  { url: "https://lit.dev/", expect: ["Lit"] },
  { url: "https://alpinejs.dev/", expect: ["Alpine.js"] },
  { url: "https://mantine.dev/", expect: ["Mantine", "React"] },
  { url: "https://ghost.org/blog/", expect: ["Ghost"] },
  { url: "https://www.framer.com/", expect: ["Framer"] },
  { url: "https://webflow.com/", expect: ["Webflow"] },
  { url: "https://laravel.com/", expect: ["Laravel", "PHP"] },
  { url: "https://plausible.io/", expect: ["Plausible"] },
  { url: "https://www.gymshark.com/", expect: ["Next.js", "Amazon CloudFront", "Amazon Web Services"] },
  {
    // WordPress + Elementor behind Cloudflare, scripts delayed by LiteSpeed Cache
    url: "https://calgameswanted.com/",
    expect: ["WordPress", "Elementor", "Hello Elementor", "Rank Math SEO", "LiteSpeed Cache", "LiteSpeed", "jQuery", "Swiper", "YouTube", "MySQL", "Cloudflare", "Cloudflare Browser Insights", "HTTP/3", "Open Graph", "RSS", "Font Awesome", "Elementor", "ElementsKit"]
  },
  {
    // WordPress on Hostinger, scripts delayed by WP Rocket (base64 data: URIs)
    url: "https://webvoltz.com/",
    expect: ["WordPress", "Site Kit by Google", "reCAPTCHA", "RSS", "Open Graph", "HTTP/3", "LiteSpeed", "WP Rocket", "PHP", "unpkg", "MySQL", "Yoast SEO", "Kadence", "WPForms", "Hostinger", "Priority Hints"]
  },
  {
    // Static Astro site (no islands) on Firebase Hosting / Fastly
    url: "https://thecuelist.com/",
    expect: ["Astro", "Tailwind CSS", "Google Fonts", "Cloudflare Browser Insights", "PWA", "Open Graph", "HTTP/3", "Priority Hints", "Fastly", "Firebase"]
  },
  {
    // Vue 2 SPA on Firebase Hosting; libraries from unpkg + Google Hosted Libraries
    url: "https://app.thecuelist.com/login?redirect=",
    expect: ["Vue.js", "Google Fonts", "webpack", "PDF.js", "HTTP/3", "unpkg", "Google Hosted Libraries", "Firebase", "Stripe", "Lodash", "core-js", "jQuery"]
  },
  {
    // Next.js 16 built with Turbopack on Vercel
    url: "https://doccine.com/",
    expect: ["Next.js", "React", "Vercel", "Vercel Analytics", "Cloudflare Turnstile", "Lucide", "Turbopack", "Tailwind CSS", "Open Graph", "Priority Hints"]
  },
  {
    // Next.js 14 app with Pendo + Zoho SalesIQ (India data centre)
    url: "https://app.doccine.com/login",
    expect: ["Next.js", "React", "Pendo", "Cloudflare Browser Insights", "Google Fonts", "HTTP/3", "Cloudflare", "Google Tag Manager", "Zoho SalesIQ", "Ant Design", "Priority Hints"]
  },
  { url: "https://example.com/", expect: [], forbid: ["WordPress", "React", "Shopify"] }
];

const BROWSERS = [
  process.env.BROWSER,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/microsoft-edge",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
].filter(Boolean);

const PORT = 9400 + Math.floor(Math.random() * 400);
const SCAN_TIMEOUT_MS = 45_000;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const dist = resolve(import.meta.dirname, "../dist");
if (!existsSync(join(dist, "manifest.json"))) {
  console.error("dist/ not found — run `npm run build` first.");
  process.exit(1);
}
const browserPath = BROWSERS.find((p) => existsSync(p));
if (!browserPath) {
  console.error("No Edge/Chromium found. Set BROWSER=<path to browser executable>.");
  process.exit(1);
}

const filter = process.argv.slice(2);
const sites = filter.length ? SITES.filter((s) => filter.some((f) => s.url.includes(f))) : SITES;

const profile = mkdtempSync(join(tmpdir(), "techstack-e2e-"));
const browser = spawn(browserPath, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  `--disable-extensions-except=${dist}`,
  `--load-extension=${dist}`,
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank"
]);

async function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => ((ws.onopen = res), (ws.onerror = rej)));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) pending.get(m.id)(m), pending.delete(m.id);
  };
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      pending.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  return {
    send,
    eval: async (expression) =>
      (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value,
    close: () => ws.close()
  };
}

async function findServiceWorker() {
  for (let i = 0; i < 60; i++) {
    await wait(500);
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const sw = targets.find((t) => t.type === "service_worker" && t.url.endsWith("/background.js"));
      if (sw) return sw;
    } catch {
      // browser still starting
    }
  }
  return null;
}

async function pageTargetFor(url) {
  const host = new URL(url).host;
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const target = targets.find((t) => t.type === "page" && t.url.includes(host));
  return target ? cdp(target.webSocketDebuggerUrl) : null;
}

async function shutdown(code) {
  try {
    const { webSocketDebuggerUrl } = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    const b = await cdp(webSocketDebuggerUrl);
    await b.send("Browser.close");
  } catch {
    browser.kill();
  }
  await wait(1000);
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
  process.exit(code);
}

const swTarget = await findServiceWorker();
if (!swTarget) {
  console.error("Extension service worker never started — did the extension load?");
  await shutdown(1);
}
const sw = await cdp(swTarget.webSocketDebuggerUrl);
console.log(`${await sw.eval("chrome.runtime.getManifest().name + ' ' + chrome.runtime.getManifest().version")} · ${sites.length} sites\n`);

let failures = 0;
for (const site of sites) {
  const tabId = await sw.eval(`chrome.tabs.create({ url: ${JSON.stringify(site.url)}, active: true }).then(t => t.id)`);
  const key = `tab:${tabId}`;
  let result = null;
  for (const started = Date.now(); !result && Date.now() - started < SCAN_TIMEOUT_MS; ) {
    await wait(750);
    result = await sw.eval(`chrome.storage.session.get(${JSON.stringify(key)}).then(r => r[${JSON.stringify(key)}] ?? null)`);
  }
  // Simulate a user interaction: sites that delay JS until then load it, and
  // the content script triggers a second scan ~2.5s later.
  if (result) {
    const before = result.technologies.length;
    const page = await pageTargetFor(site.url);
    if (page) {
      await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 200, y: 200 });
      await page.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 200, y: 200, deltaX: 0, deltaY: 300 });
      page.close();
      await wait(6000);
      result = (await sw.eval(`chrome.storage.session.get(${JSON.stringify(key)}).then(r => r[${JSON.stringify(key)}] ?? null)`)) ?? result;
      result.afterInteraction = result.technologies.length - before;
    }
  }
  await sw.eval(`chrome.tabs.remove(${tabId})`);

  if (!result) {
    failures++;
    console.log(`✖ ${site.url}\n    no scan result within ${SCAN_TIMEOUT_MS / 1000}s\n`);
    continue;
  }

  // E2E_DUMP=<dir> writes each site's full scan result for debugging
  if (process.env.E2E_DUMP) writeFileSync(join(process.env.E2E_DUMP, `${new URL(site.url).host}.json`), JSON.stringify(result, null, 2));

  const found = new Map(result.technologies.map((t) => [t.name, t]));
  const missing = site.expect.filter((n) => !found.has(n));
  const forbidden = (site.forbid ?? []).filter((n) => found.has(n));
  const passed = !missing.length && !forbidden.length;
  if (!passed) failures++;

  const extra = result.afterInteraction ? `, +${result.afterInteraction} after interaction` : "";
  console.log(`${passed ? "✔" : "✖"} ${site.url}  (${result.technologies.length} found${extra}, ${result.scanDurationMs}ms)`);
  for (const t of result.technologies) {
    const mark = site.expect.includes(t.name) ? "•" : " ";
    console.log(`  ${mark} ${t.level.padEnd(9)} ${String(t.confidence).padStart(3)}  ${t.name}${t.version ? ` ${t.version}` : ""}${t.impliedBy ? `  (via ${t.impliedBy})` : ""}`);
  }
  if (missing.length) console.log(`    missing: ${missing.join(", ")}`);
  if (forbidden.length) console.log(`    should not detect: ${forbidden.join(", ")}`);
  console.log();
}

console.log(failures ? `${failures}/${sites.length} sites failed` : `All ${sites.length} sites passed`);
sw.close();
await shutdown(failures ? 1 : 0);
