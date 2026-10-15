import { compilePattern, extractVersion } from "./patterns.js";
import { createEvidence } from "./evidence.js";

const toArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// Cookie names in rules: "exact", "glob_*" or "/regex/".
function cookieKeyRegex(key) {
  if (key.length > 2 && key.startsWith("/") && key.endsWith("/")) return new RegExp(key.slice(1, -1));
  if (!key.includes("*")) return null;
  return new RegExp(`^${key.split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);
}

// Flattens a rule file entry into a list of signals:
//   { type, key, regex, weight, version, attribute }
export function compileRule(rule) {
  const signals = [];
  const add = (type, key, spec) => {
    const keyRegex = type === "cookies" ? cookieKeyRegex(key) : null;
    for (const s of toArray(spec === true ? {} : spec)) signals.push({ type, key, keyRegex, ...compilePattern(s, type) });
  };

  for (const type of ["html", "text", "scripts", "css", "scriptSrc", "links", "xhr", "url"]) {
    for (const spec of toArray(rule[type])) add(type, null, spec);
  }
  for (const type of ["meta", "headers"]) {
    for (const [key, spec] of Object.entries(rule[type] ?? {})) add(type, key.toLowerCase(), spec);
  }
  for (const type of ["cookies", "js", "dom"]) {
    for (const [key, spec] of Object.entries(rule[type] ?? {})) add(type, key, spec);
  }
  for (const type of ["expando", "cssVars", "jsPrefix"]) {
    for (const key of rule[type] ?? []) add(type, key, {});
  }

  return { ...rule, signals };
}

// Raw values from the fingerprint that a signal should be tested against.
function valuesFor(signal, fp) {
  const { type, key } = signal;
  switch (type) {
    case "html":
      // Page markup plus decoded data: URI scripts (WP Rocket delayed JS)
      return [fp.html, fp.inlineScripts].filter(Boolean);
    case "css":
      return fp.css ? [fp.css] : [];
    case "text":
      return fp.text ? [fp.text] : [];
    case "scripts":
      // Inline script contents, including decoded data: scripts
      return [fp.scriptContent, fp.inlineScripts].filter(Boolean);
    case "xhr":
      return fp.requests ?? [];
    case "url":
      return fp.url ? [fp.url] : [];
    case "scriptSrc":
    case "links":
      return fp[type] ?? [];
    case "meta":
      return fp.meta?.[key] ?? [];
    case "headers":
      return fp.headers?.[key] != null ? [fp.headers[key]] : [];
    case "cookies": {
      // Returns matching cookie *names*; matchSignal looks up the values.
      const cookies = fp.cookies ?? {};
      if (signal.keyRegex) return Object.keys(cookies).filter((n) => signal.keyRegex.test(n));
      return key in cookies ? [key] : [];
    }
    case "js":
      return fp.js && key in fp.js ? [fp.js[key]] : [];
    case "dom": {
      const node = fp.dom?.[key];
      if (!node?.exists) return [];
      if (!signal.attribute) return [true];
      const attr = node.attributes?.[signal.attribute];
      return attr == null ? [] : [attr];
    }
    case "expando":
      return fp.expando?.[key] ? [true] : [];
    case "cssVars":
      return fp.cssVars?.[key] ? [fp.cssVars[key]] : [];
    case "jsPrefix":
      // value is the actual global name found, e.g. "webpackChunk_N_E"
      return fp.jsPrefix?.[key] ? [fp.jsPrefix[key]] : [];
    default:
      return [];
  }
}

// What we show the user as the matched value (never cookie values — privacy).
function displayValue(signal, value, match) {
  switch (signal.type) {
    case "html":
    case "css":
    case "text":
    case "scripts":
      return match?.[0] ?? "";
    case "cookies":
      return "cookie set";
    case "js":
      return typeof value === "string" || typeof value === "number" ? `${value}` : "defined";
    case "dom":
    case "expando":
      return value === true ? "present" : value;
    default:
      return value;
  }
}

// Runs one signal against the fingerprint.
// Returns { evidence, version } for the first matching value, or null.
export function matchSignal(signal, fp) {
  const isCookie = signal.type === "cookies";
  for (const item of valuesFor(signal, fp)) {
    const value = isCookie ? fp.cookies[item] : item;
    if (value == null || value === false) continue;

    let match = null;
    if (signal.regex) {
      match = signal.regex.exec(String(value));
      if (!match) continue;
    }

    return {
      evidence: createEvidence({
        type: signal.type,
        // For wildcard/regex cookie rules, show the cookie that actually matched
        key: isCookie ? item : signal.key,
        value: displayValue(signal, value, match),
        weight: signal.weight
      }),
      version: extractVersion(signal.version, match)
    };
  }
  return null;
}
