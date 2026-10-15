const MAX_URLS = 300;

// Performance plugins (LiteSpeed Cache, WP Rocket, Perfmatters, FlyingPress…)
// delay scripts until the first user interaction by moving `src` into a data
// attribute and changing `type`. Read those too, or most of a WordPress
// site's stack is invisible until someone clicks.
const DELAYED_SRC_ATTRIBUTES = ["data-src", "data-rocket-src", "data-litespeed-src", "data-lazy-src", "data-pagespeed-orig-src", "data-delay-src"];

const MAX_INLINE_LENGTH = 300_000;

const unique = (urls) => [...new Set(urls.filter(Boolean))].slice(0, MAX_URLS);
const isDataUrl = (url) => typeof url === "string" && url.startsWith("data:");

function absolute(url) {
  try {
    return new URL(url, location.href).href;
  } catch {
    return null;
  }
}

// <script src> URLs (including delayed ones), plus scripts the page loaded
// dynamically (they show up in the Performance API even when the <script>
// tag was removed afterwards).
export function scanScripts() {
  const tags = [...document.scripts].flatMap((s) => [
    s.src,
    ...DELAYED_SRC_ATTRIBUTES.map((attr) => s.getAttribute(attr)).filter(Boolean).map(absolute)
  ]);
  const loaded = performance
    .getEntriesByType("resource")
    .filter((e) => e.initiatorType === "script")
    .map((e) => e.name);
  return unique([...tags, ...loaded].filter((url) => !isDataUrl(url)));
}

// WP Rocket's "delay JS" turns inline scripts into
// <script data-rocket-src="data:text/javascript;base64,…">. Decode them so
// they're matched like any other inline script (which outerHTML already has).
export function scanInlineDataScripts() {
  let text = "";
  for (const script of document.scripts) {
    for (const attr of ["src", ...DELAYED_SRC_ATTRIBUTES]) {
      const value = script.getAttribute(attr);
      if (!isDataUrl(value)) continue;
      try {
        const [meta, data = ""] = value.split(",", 2);
        const decoded = meta.endsWith(";base64")
          ? new TextDecoder().decode(Uint8Array.from(atob(data), (c) => c.charCodeAt(0)))
          : decodeURIComponent(data);
        text += `\n${decoded}`;
      } catch {
        // malformed data URL — ignore
      }
      if (text.length > MAX_INLINE_LENGTH) return text.slice(0, MAX_INLINE_LENGTH);
    }
  }
  return text;
}

// Contents of inline <script> tags (no src) — what Wappalyzer-format
// "scripts" patterns are matched against.
export function scanInlineScriptContent() {
  let text = "";
  for (const script of document.scripts) {
    if (script.src || script.type === "application/ld+json") continue;
    text += `\n${script.textContent}`;
    if (text.length > MAX_INLINE_LENGTH) return text.slice(0, MAX_INLINE_LENGTH);
  }
  return text;
}

// XHR / fetch / beacon calls the page made — APIs like ip-api.com.
export function scanRequests() {
  return unique(
    performance
      .getEntriesByType("resource")
      .filter((e) => ["fetch", "xmlhttprequest", "beacon", "other"].includes(e.initiatorType))
      .map((e) => e.name)
  );
}

// <link href> URLs — stylesheets, fonts, preloads.
export function scanLinks() {
  const tags = [...document.querySelectorAll("link[href]")].map((l) => l.href);
  const loaded = performance
    .getEntriesByType("resource")
    .filter((e) => e.initiatorType === "link" || e.initiatorType === "css")
    .map((e) => e.name);
  return unique([...tags, ...loaded]);
}
