// <meta name|property|http-equiv> → [content, …], keys lowercased.
export function scanMeta() {
  const meta = {};
  for (const el of document.querySelectorAll("meta[content]")) {
    const key = (el.getAttribute("name") || el.getAttribute("property") || el.getAttribute("http-equiv") || "").toLowerCase();
    if (!key) continue;
    (meta[key] ??= []).push(el.getAttribute("content"));
  }
  return meta;
}

// Runs the selector checks the rules asked for (see engine/probe.js).
export function probeDom(domProbe = []) {
  const result = {};
  for (const { selector, attributes } of domProbe) {
    let el = null;
    try {
      el = document.querySelector(selector);
    } catch {
      continue; // invalid selector in a rule — skip, don't break the scan
    }
    result[selector] = {
      exists: Boolean(el),
      // "#text" is a pseudo-attribute: the element's text content
      attributes: el
        ? Object.fromEntries(attributes.map((a) => [a, a === "#text" ? el.textContent.slice(0, 500) : el.getAttribute(a)]))
        : {}
    };
  }
  return result;
}

// Computed CSS custom properties, e.g. Tailwind's --tw-* variables.
export function probeCssVars(names = []) {
  if (!names.length || !document.body) return {};
  const style = getComputedStyle(document.body);
  const result = {};
  for (const name of names) {
    const value = style.getPropertyValue(name).trim();
    if (value) result[name] = value;
  }
  return result;
}
