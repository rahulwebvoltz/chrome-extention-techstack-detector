import { scanHtml } from "./htmlScanner.js";
import { scanScripts, scanLinks, scanInlineDataScripts, scanInlineScriptContent, scanRequests } from "./scriptScanner.js";
import { scanCss } from "./cssScanner.js";
import { scanMeta, probeDom, probeCssVars } from "./domScanner.js";
import { scanCookies } from "./cookieScanner.js";

// Everything the content script (isolated world) can observe. JS globals,
// headers and network requests are added later by the service worker.
export function collectFingerprint(probe = {}) {
  return {
    url: location.href,
    html: scanHtml(),
    inlineScripts: scanInlineDataScripts(),
    scriptContent: scanInlineScriptContent(),
    // Visible text (Wappalyzer-format "text" patterns), capped
    text: (document.body?.innerText ?? "").slice(0, 100_000),
    css: scanCss(),
    scriptSrc: scanScripts(),
    links: scanLinks(),
    requests: scanRequests(),
    meta: scanMeta(),
    cookies: scanCookies(),
    dom: probeDom(probe.dom),
    cssVars: probeCssVars(probe.cssVars)
  };
}
