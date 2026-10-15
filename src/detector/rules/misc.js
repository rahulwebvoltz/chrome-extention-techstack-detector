// Protocols, standards, build tooling, databases and Cloudflare add-ons.
export default [
  // ---------- Databases (only ever implied: never visible from a browser) ----------
  { name: "MySQL", category: "database", website: "https://www.mysql.com", color: "#4479a1" },

  // ---------- Web standards ----------
  {
    name: "Open Graph",
    category: "misc",
    website: "https://ogp.me",
    color: "#4267b2",
    meta: { "og:title": { weight: 100 }, "og:type": { weight: 100 } }
  },
  {
    name: "RSS",
    category: "misc",
    website: "https://www.rssboard.org/rss-specification",
    color: "#ffa500",
    html: [{ pattern: /<link[^>]+type=["']application\/(?:rss|atom)\+xml["']/i, weight: 100 }]
  },
  {
    name: "HTTP/3",
    category: "misc",
    website: "https://httpwg.org/specs/rfc9114.html",
    color: "#005a9c",
    headers: { "alt-svc": /\bh3(?:-\d+)?=/i }
  },
  {
    name: "HSTS",
    category: "security",
    website: "https://developer.mozilla.org/docs/Web/HTTP/Headers/Strict-Transport-Security",
    color: "#2e7d32",
    headers: { "strict-transport-security": /max-age=\d+/i }
  },
  {
    name: "PWA",
    category: "misc",
    website: "https://web.dev/explore/progressive-web-apps",
    color: "#5a0fc8",
    // Web app manifest + theme colour; an active service worker makes it certain
    dom: { 'link[rel="manifest"]': { weight: 70 } },
    // Supporting only: plenty of non-PWA sites set a theme colour
    meta: { "theme-color": { weight: 20, versionOnly: true } },
    js: { "navigator.serviceWorker.controller": { weight: 60 } }
  },
  {
    name: "Priority Hints",
    category: "misc",
    website: "https://web.dev/articles/fetch-priority",
    color: "#1a73e8",
    html: [{ pattern: /\sfetchpriority=["'](?:high|low|auto)["']/i, weight: 100 }]
  },

  // ---------- Build tools ----------
  {
    name: "webpack",
    category: "build",
    website: "https://webpack.js.org",
    color: "#8dd6f9",
    // webpack 5 runtime global is "webpackChunk<projectName>"
    jsPrefix: ["webpackChunk"],
    js: { webpackJsonp: { weight: 90 } }
  },
  {
    name: "Turbopack",
    category: "build",
    website: "https://turbo.build/pack",
    color: "#ef4444",
    // Next.js bundles built with Turbopack ship a turbopack-<hash>.js runtime chunk
    scriptSrc: [{ pattern: /\/_next\/static\/[^"'\s]*\/turbopack-[\w-]+\.js/i, weight: 100 }],
    js: { TURBOPACK: { weight: 90 } }
  },
  {
    name: "Vite",
    category: "build",
    website: "https://vite.dev",
    color: "#646cff",
    // Vite's default asset naming: /assets/<name>-<8 char hash>.js as a module script
    html: [{ pattern: /<script type="module" crossorigin src="[^"]*\/assets\/[\w.-]+-[A-Za-z0-9_-]{8}\.js"/, weight: 60 }]
  },

  // ---------- Cloudflare add-ons ----------
  {
    name: "Cloudflare Browser Insights",
    category: "analytics",
    website: "https://www.cloudflare.com/web-analytics/",
    color: "#f38020",
    scriptSrc: [{ pattern: /static\.cloudflareinsights\.com\/beacon/i, weight: 100 }],
    html: [{ pattern: /data-cf-beacon=/i, weight: 90 }],
    xhr: [{ pattern: /\/cdn-cgi\/rum\?/i, weight: 90 }]
  },

  // ---------- Geolocation APIs (seen as XHR/fetch calls) ----------
  {
    name: "ip-api",
    category: "geolocation",
    website: "https://ip-api.com",
    color: "#2c3e50",
    xhr: [{ pattern: /\/\/(?:pro\.)?ip-api\.com\//i, weight: 100 }],
    html: [{ pattern: /(?:pro\.)?ip-api\.com\/(?:json|line|csv|xml|php|batch)/i, weight: 80 }]
  },
  {
    name: "IPinfo",
    category: "geolocation",
    website: "https://ipinfo.io",
    color: "#0e6ffd",
    xhr: [{ pattern: /\/\/ipinfo\.io\//i, weight: 100 }],
    html: [{ pattern: /ipinfo\.io\/(?:json|[\d.]+\/json)/i, weight: 80 }]
  },
  {
    name: "ipapi",
    category: "geolocation",
    website: "https://ipapi.co",
    color: "#ff6f00",
    xhr: [{ pattern: /\/\/ipapi\.co\//i, weight: 100 }],
    html: [{ pattern: /ipapi\.co\/(?:json|[\w.:]+\/json)/i, weight: 80 }]
  },
  {
    name: "Cloudflare Rocket Loader",
    category: "caching",
    website: "https://developers.cloudflare.com/speed/optimization/content/rocket-loader/",
    color: "#f38020",
    scriptSrc: [{ pattern: /\/cdn-cgi\/scripts\/[^/]+\/cloudflare-static\/rocket-loader\.min\.js/i, weight: 100 }],
    html: [{ pattern: /type=["'][0-9a-f]{24}-text\/javascript["']/i, weight: 80 }]
  },
  {
    name: "Gravatar",
    category: "misc",
    website: "https://gravatar.com",
    color: "#1e8cbe",
    html: [{ pattern: /(?:secure|www|\d)\.gravatar\.com\/avatar\//i, weight: 90 }]
  }
];
