// Converts webappanalyzer (Wappalyzer-format) fingerprints into our rule
// format. Pure functions — used by scripts/import-wappalyzer.mjs and tests.
//
// Wappalyzer format reference:
//   patterns are regex source strings with modifiers: "re\;version:\1\;confidence:50"
//   html | text | scripts | scriptSrc | css | url | xhr : string | string[]
//   meta | headers | cookies | js : { key: pattern | pattern[] }
//   dom : selector | selector[] | { selector: { exists, attributes, text, properties } }
//   implies | excludes | requires : name | name[] (may carry modifiers)
//   requiresCategory : categoryId[]
//   dns | robots | certIssuer | probe : server-side only — not usable in a browser

// Their category name → our category id. Anything unmapped keeps its own
// label as a pack category ("wa-<id>").
export const CATEGORY_MAP = {
  CMS: "cms",
  Blogs: "cms",
  "Page builders": "pageBuilder",
  Ecommerce: "ecommerce",
  "Payment processors": "payments",
  "Buy now pay later": "payments",
  "JavaScript frameworks": "framework",
  "Static site generator": "framework",
  "JavaScript libraries": "library",
  "UI frameworks": "ui",
  "Font scripts": "fonts",
  "WordPress themes": "wpTheme",
  "WordPress plugins": "wpPlugin",
  SEO: "seo",
  Caching: "caching",
  Performance: "caching",
  Analytics: "analytics",
  RUM: "analytics",
  "Tag managers": "tagManager",
  "Marketing automation": "marketing",
  Email: "marketing",
  Advertising: "advertising",
  Retargeting: "advertising",
  "Video players": "video",
  Maps: "maps",
  Geolocation: "geolocation",
  "Live chat": "chat",
  Widgets: "widgets",
  "Comment systems": "widgets",
  "Cookie compliance": "consent",
  Security: "security",
  Authentication: "security",
  CDN: "cdn",
  Hosting: "hosting",
  PaaS: "hosting",
  IaaS: "hosting",
  "Web servers": "server",
  "Reverse proxies": "server",
  "Web frameworks": "backend",
  "Programming languages": "language",
  Databases: "database",
  Development: "build",
  Miscellaneous: "misc"
};

// Their name → our hand-written rule's name, where they differ. Our rule
// wins; references (implies/requires) are redirected to it.
export const NAME_ALIASES = {
  "Google Font API": "Google Fonts",
  LottieFiles: "Lottie",
  "Nuxt.js": "Nuxt",
  "Facebook Pixel": "Meta Pixel",
  "Matomo Analytics": "Matomo",
  "Mapbox GL JS": "Mapbox",
  "Crisp Live Chat": "Crisp",
  Azure: "Microsoft Azure",
  "Azure CDN": "Microsoft Azure",
  "DigitalOcean Spaces": "DigitalOcean",
  IIS: "Microsoft IIS",
  "Microsoft ASP.NET": "ASP.NET",
  "Kadence WP Kadence": "Kadence",
  "Site Kit": "Site Kit by Google",
  "HubSpot CMS Hub": "HubSpot CMS",
  "TYPO3 CMS": "TYPO3",
  "Klarna Checkout": "Klarna",
  "ZURB Foundation": "Foundation",
  "WordPress Super Cache": "WP Super Cache",
  "RankMath SEO": "Rank Math SEO",
  Unpkg: "unpkg",
  "Twitter": "X (Twitter) widgets",
  "Facebook Login": "Facebook SDK",
  "Elementor Header & Footer Builder": "Elementor Header & Footer Builder",
  "Amazon Web Services": "Amazon Web Services",
  "Vercel Analytics": "Vercel Analytics"
};

// Fixes for fingerprints in the upstream data that misfire on real sites
// (found by our e2e suite). Return null to drop a technology entirely.
export const PACK_PATCHES = {
  // Its only cookie is Marketo's tracking cookie (_mkto_trk), not PyScript's
  PyScript: (rule) => {
    delete rule.cookies;
    return rule;
  },
  // window.amzn is defined by Amazon Ads/Associates scripts on many non-Webstore sites
  "Amazon Webstore": () => null,
  // "/.*onsen.*min\.js" also matches "…consent…min.js"
  "Onsen UI": (rule) => {
    rule.scriptSrc = [{ regex: "(?:^|/)(?:angular-)?onsenui(?:\\.min)?\\.js", weight: 100 }];
    return rule;
  },
  // "svSession" is Wix's own session cookie name, present in every Wix page's scripts
  Sirvoy: (rule) => {
    delete rule.scripts;
    return rule;
  },
  // window.search.indexName is set by Algolia search setups on many non-Docusaurus sites
  Docusaurus: (rule) => {
    if (rule.js) delete rule.js["search.indexName"];
    return rule;
  },
  // Unanchored "p5.js" matches hashed bundle chunks whose names end in "…p5.js"
  "p5.js": (rule) => {
    rule.scriptSrc = (rule.scriptSrc ?? []).map((s) => ({ ...s, regex: `(?:^|/)${s.regex}` }));
    return rule;
  }
};

const SERVER_ONLY = ["dns", "robots", "certIssuer", "probe"];
const LIST_FIELDS = { html: "html", text: "text", scripts: "scripts", scriptSrc: "scriptSrc", css: "css", url: "url", xhr: "xhr" };
const MAP_FIELDS = ["meta", "headers", "cookies", "js"];

export const normalizeName = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
const toArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const stripModifiers = (s) => String(s).split("\\;")[0];

// "re\;version:\1\;confidence:50" → { regex, version, weight } (null if invalid)
export function parsePattern(raw) {
  const [source, ...mods] = String(raw).split("\\;");
  const spec = { weight: 100 };
  for (const mod of mods) {
    const i = mod.indexOf(":");
    const key = mod.slice(0, i);
    const value = mod.slice(i + 1);
    if (key === "version") spec.version = value;
    else if (key === "confidence") spec.weight = Number(value) || 0;
  }
  // confidence:0 means "only use this for the version" — never a detection
  if (spec.weight === 0) spec.versionOnly = true;
  if (source !== "") {
    try {
      new RegExp(source, "i");
    } catch {
      return null;
    }
    spec.regex = source;
  }
  return spec;
}

const parseAll = (values, stats) =>
  toArray(values)
    .map((v) => {
      const spec = parsePattern(v);
      if (!spec) stats.invalidPatterns++;
      return spec;
    })
    .filter(Boolean);

// Returns { dom, expando }. `properties` checks (JS properties on elements,
// e.g. Preact's __k) need the page's main world, so they become our
// `expando` signals — never a bare "element exists" check, which would match
// broad selectors like "body" on every page.
function convertDom(dom, stats) {
  const out = {};
  const expando = [];
  if (typeof dom === "string" || Array.isArray(dom)) {
    for (const selector of toArray(dom)) out[selector] = [{ weight: 100 }];
    return { dom: out, expando };
  }
  for (const [selector, checks] of Object.entries(dom ?? {})) {
    if (checks.properties) {
      expando.push(...Object.keys(checks.properties));
      if (!checks.attributes && checks.text == null && checks.exists == null) continue;
    }
    const specs = [];
    for (const [attribute, pattern] of Object.entries(checks.attributes ?? {})) {
      const spec = parsePattern(pattern);
      if (spec) specs.push({ ...spec, attribute });
      else stats.invalidPatterns++;
    }
    if (checks.text != null) {
      const spec = parsePattern(checks.text);
      if (spec) specs.push({ ...spec, attribute: "#text" });
      else stats.invalidPatterns++;
    }
    // `exists` → presence
    if (!specs.length) specs.push({ weight: 100 });
    out[selector] = specs;
  }
  return { dom: out, expando };
}

// Cookie names in their data can be regexes ("_hjSession_\d+"), sometimes
// with a PCRE inline flag "(?i)" that JavaScript doesn't support (matching is
// case-sensitive for cookie names anyway). Returns null if unusable.
function cookieKey(name) {
  if (!/[\\^$*+?()[\]{}|]/.test(name)) return name;
  const source = name.replace(/\(\?i\)/g, "").replace(/^\^|\$$/g, "");
  try {
    new RegExp(source);
  } catch {
    return null;
  }
  return `/^${source}$/`;
}

function pickCategory(cats, categories) {
  const ids = toArray(cats);
  for (const id of ids) {
    const mapped = CATEGORY_MAP[categories[id]?.name];
    if (mapped) return { category: mapped };
  }
  const id = ids[0];
  const meta = categories[id];
  return meta
    ? { category: `wa-${id}`, categoryLabel: meta.name, categoryOrder: 40 + (meta.priority ?? 9) }
    : { category: "misc" };
}

/**
 * Convert the whole technologies object.
 * @param {Record<string, object>} technologies  merged contents of technologies/*.json
 * @param {Record<string, {name:string, priority:number}>} categories  categories.json
 * @param {string[]} coreNames  names of our hand-written rules (they take precedence)
 */
export function convertAll(technologies, categories, coreNames) {
  const stats = { total: 0, converted: 0, skippedCore: 0, skippedServerOnly: 0, invalidPatterns: 0 };
  const coreExact = new Set(coreNames);
  const coreByNorm = new Map(coreNames.map((n) => [normalizeName(n), n]));

  // Resolve a Wappalyzer name to the name it will have in our combined rule set.
  const resolveName = (name) => {
    const clean = stripModifiers(name).trim();
    // Exact name first: "ip-api" and "ipapi" are different services that
    // normalise to the same key.
    if (NAME_ALIASES[clean]) return NAME_ALIASES[clean];
    if (coreExact.has(clean)) return clean;
    return coreByNorm.get(normalizeName(clean)) ?? clean;
  };
  const isCore = (name) => coreByNorm.has(normalizeName(resolveName(name)));

  // Technologies that something implies must be kept even without signals (e.g. MySQL).
  const implied = new Set();
  for (const tech of Object.values(technologies)) for (const n of toArray(tech.implies)) implied.add(resolveName(n));

  const rules = [];
  const seen = new Set(); // their data has a few case-only duplicates ("FastSpring"/"Fastspring")
  for (const [name, tech] of Object.entries(technologies)) {
    stats.total++;
    // Technologies we already have a hand-written rule for: their signals are
    // emitted as a *supplement* that gets merged into our rule (pack builds
    // only), so we keep our tuned rule but don't lose signals ours lacks.
    const coreName = isCore(name) ? resolveName(name) : null;
    if (!coreName) {
      if (seen.has(name.toLowerCase())) {
        stats.duplicates = (stats.duplicates ?? 0) + 1;
        continue;
      }
      seen.add(name.toLowerCase());
    }

    const rule = coreName
      ? { name: coreName, supplement: true }
      : { name, ...pickCategory(tech.cats, categories), website: tech.website ?? null, pack: "wappalyzer" };
    // Upstream icon file (vendor/webappanalyzer/icons); copied into pack builds
    if (tech.icon) rule.iconFile = tech.icon;

    for (const [field, target] of Object.entries(LIST_FIELDS)) {
      const specs = parseAll(tech[field], stats);
      if (specs.length) rule[target] = [...(rule[target] ?? []), ...specs];
    }
    for (const field of MAP_FIELDS) {
      if (!tech[field]) continue;
      const out = {};
      for (const [key, value] of Object.entries(tech[field])) {
        const specs = parseAll(value === "" ? [""] : value, stats);
        const outKey = field === "cookies" ? cookieKey(key) : key;
        if (outKey === null) stats.invalidPatterns++;
        else if (specs.length) out[outKey] = specs;
      }
      if (Object.keys(out).length) rule[field] = out;
    }
    if (tech.dom) {
      const { dom, expando } = convertDom(tech.dom, stats);
      if (Object.keys(dom).length) rule.dom = dom;
      if (expando.length) rule.expando = expando;
    }

    if (coreName) {
      // Supplements carry signals only; our rule keeps its own category,
      // implies/excludes and tuning.
      const patched = PACK_PATCHES[name] ? PACK_PATCHES[name](rule) : rule;
      const hasSignals = patched && Object.keys(patched).some((k) => !["name", "supplement", "iconFile"].includes(k));
      if (hasSignals || patched?.iconFile) {
        rules.push(patched);
        stats.supplements = (stats.supplements ?? 0) + 1;
      }
      stats.skippedCore++;
      continue;
    }

    const implies = toArray(tech.implies).map(resolveName);
    const excludes = toArray(tech.excludes).map(resolveName);
    const requires = toArray(tech.requires).map(resolveName);
    const requiresCategory = toArray(tech.requiresCategory).map((id) => pickCategory([id], categories).category);
    if (implies.length) rule.implies = implies;
    if (excludes.length) rule.excludes = excludes;
    if (requires.length) rule.requires = requires;
    if (requiresCategory.length) rule.requiresCategory = requiresCategory;

    const hasSignal = Object.keys(LIST_FIELDS).some((f) => tech[f]) || MAP_FIELDS.some((f) => tech[f]) || tech.dom;
    if (!hasSignal && !implied.has(name)) {
      if (SERVER_ONLY.some((f) => tech[f])) stats.skippedServerOnly++;
      continue;
    }
    const patched = PACK_PATCHES[name] ? PACK_PATCHES[name](rule) : rule;
    if (!patched) {
      stats.patchedOut = (stats.patchedOut ?? 0) + 1;
      continue;
    }
    rules.push(patched);
    stats.converted++;
  }
  return { rules, stats };
}
