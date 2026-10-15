// Some signals can't be checked from a static fingerprint — DOM selectors,
// CSS variables and JS globals must be evaluated *inside* the page. The probe
// is the de-duplicated list of those checks, derived from the rules, so the
// page-side collectors only do work the rules actually need.
export function buildProbe(compiledRules) {
  const dom = new Map();
  const js = new Set();
  const expando = new Set();
  const cssVars = new Set();
  const jsPrefix = new Set();

  for (const rule of compiledRules) {
    for (const { type, key, attribute } of rule.signals) {
      if (type === "dom") {
        if (!dom.has(key)) dom.set(key, new Set());
        if (attribute) dom.get(key).add(attribute);
      } else if (type === "js") js.add(key);
      else if (type === "expando") expando.add(key);
      else if (type === "cssVars") cssVars.add(key);
      else if (type === "jsPrefix") jsPrefix.add(key);
    }
  }

  return {
    dom: [...dom].map(([selector, attributes]) => ({ selector, attributes: [...attributes] })),
    js: [...js],
    expando: [...expando],
    cssVars: [...cssVars],
    jsPrefix: [...jsPrefix]
  };
}
