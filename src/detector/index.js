import rules from "./rules/index.js";
import packRules from "./packs/active.js";
import { createDetector } from "./engine/detector.js";

// Merge a pack "supplement" (extra signals for a technology we already have a
// hand-written rule for) into our rule. Our rule keeps its category, implies
// and tuning; the pack only adds signals ours lacks.
const LIST_FIELDS = ["html", "text", "scripts", "css", "scriptSrc", "links", "xhr", "url", "expando", "jsPrefix", "cssVars"];
const MAP_FIELDS = ["meta", "headers", "cookies", "js", "dom"];
const toArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

function mergeSupplement(rule, supplement) {
  const merged = { ...rule };
  if (supplement.iconFile && !rule.iconFile) merged.iconFile = supplement.iconFile;
  for (const field of LIST_FIELDS) {
    if (supplement[field]) merged[field] = [...toArray(rule[field]), ...supplement[field]];
  }
  for (const field of MAP_FIELDS) {
    if (!supplement[field]) continue;
    const out = { ...(rule[field] ?? {}) };
    for (const [rawKey, specs] of Object.entries(supplement[field])) {
      // header/meta names are case-insensitive — merge onto our lowercase key
      const key = field === "headers" || field === "meta" ? rawKey.toLowerCase() : rawKey;
      out[key] = key in out ? [...toArray(out[key] === true ? {} : out[key]), ...specs] : specs;
    }
    merged[field] = out;
  }
  return merged;
}

const supplements = new Map(packRules.filter((r) => r.supplement).map((r) => [r.name, r]));
const ownRules = rules.map((rule) => (supplements.has(rule.name) ? mergeSupplement(rule, supplements.get(rule.name)) : rule));

// Our hand-written rules (supplemented when a pack is built in) plus the pack's
// own technologies. Rules are compiled once when the service worker starts.
export const detector = createDetector([...ownRules, ...packRules.filter((r) => !r.supplement)]);
export const packRuleCount = packRules.length - supplements.size;
