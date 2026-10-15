// Collects basic, read-only facts about the current page.
// Phase 2 extends this into the full HTML / DOM / script / cookie scanners.
const meta = (selector) => document.querySelector(selector)?.getAttribute("content")?.trim() || null;

function getFavicon() {
  const link = document.querySelector('link[rel~="icon"]');
  try {
    return new URL(link?.getAttribute("href") || "/favicon.ico", location.href).href;
  } catch {
    return null;
  }
}

export function scanPage() {
  const scripts = [...document.scripts];

  return {
    url: location.href,
    hostname: location.hostname,
    protocol: location.protocol.replace(":", ""),
    title: document.title || null,
    description: meta('meta[name="description"]') ?? meta('meta[property="og:description"]'),
    generator: meta('meta[name="generator"]'),
    language: document.documentElement.lang || null,
    charset: document.characterSet || null,
    favicon: getFavicon(),
    stats: {
      scripts: scripts.length,
      externalScripts: scripts.filter((s) => s.src).length,
      stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
      iframes: document.querySelectorAll("iframe").length,
      images: document.images.length,
      links: document.links.length
    },
    scannedAt: Date.now()
  };
}
