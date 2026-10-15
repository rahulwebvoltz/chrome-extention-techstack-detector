// Text of the page's stylesheets. Optimisers (LiteSpeed, WP Rocket,
// Autoptimize…) merge every plugin's CSS into one file, which hides the
// original URLs — but the rules inside (e.g. "Font Awesome 5 Free",
// fonts.gstatic.com) survive.
//
// Only same-origin sheets are readable; cross-origin ones throw and are
// skipped (their URLs are still matched via `links`).
const MAX_CSS_LENGTH = 400_000;

export function scanCss() {
  let text = "";
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin
    }
    for (const rule of rules) {
      text += rule.cssText;
      if (text.length > MAX_CSS_LENGTH) return text.slice(0, MAX_CSS_LENGTH);
    }
  }
  return text;
}
