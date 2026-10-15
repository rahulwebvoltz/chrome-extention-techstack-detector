// Turns the human-friendly pattern specs used in rule files into compiled
// signals the matcher can run.
//
// A PatternSpec is one of:
//   RegExp                         → match with this regex
//   "string"                       → case-insensitive literal match
//   true / {}                      → the key just has to exist
//   { pattern?, weight?, version?, attribute?, versionOnly? }
//
// versionOnly: the signal can supply a version but never detects on its own.
//
// `version` is a template like "\\1" filled from regex capture groups.

// How much a single matching signal of each type contributes (0–100).
// Strong, hard-to-fake signals (meta generator, headers, JS globals) score
// high; loose text matches score low so they alone only yield "possible".
export const DEFAULT_WEIGHTS = {
  html: 40,
  css: 60,
  text: 40,
  scripts: 50,
  xhr: 80,
  scriptSrc: 60,
  links: 60,
  url: 40,
  meta: 100,
  headers: 100,
  cookies: 60,
  js: 80,
  dom: 70,
  expando: 90,
  jsPrefix: 80,
  cssVars: 80
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function compilePattern(spec, type) {
  if (spec === true || spec == null || spec === "") spec = {};
  else if (spec instanceof RegExp || typeof spec === "string") spec = { pattern: spec };

  const { pattern, version = null, attribute = null, versionOnly = false } = spec;
  const weight = spec.weight ?? (versionOnly ? 0 : DEFAULT_WEIGHTS[type]);
  let regex = null;
  if (pattern instanceof RegExp) regex = pattern;
  else if (typeof pattern === "string") regex = new RegExp(escapeRegex(pattern), "i");
  // Imported rule packs store regexes as source strings (JSON-friendly)
  else if (typeof spec.regex === "string") regex = new RegExp(spec.regex, "i");

  return { regex, weight, version, attribute, versionOnly };
}

export function extractVersion(template, match) {
  if (!template || !match) return null;
  // Ternary form "\1?yes:no" — "yes" if group 1 matched, else "no"
  const ternary = /^\\(\d)\?([^:]*):(.*)$/.exec(template);
  const filled = ternary
    ? match[Number(ternary[1])] ? ternary[2] : ternary[3]
    : template;
  const version = filled.replace(/\\(\d)/g, (_, n) => match[Number(n)] ?? "").trim();
  return /\d/.test(version) ? version : null;
}

// Prefer the most specific version: "18.3.1" beats "18".
export function pickVersion(versions) {
  return versions.filter(Boolean).sort((a, b) => b.split(".").length - a.split(".").length || b.length - a.length)[0] ?? null;
}
