// Single source of truth for every message passed between extension parts.
//
//   content    ──PAGE_READY──────────▶ background  (page loaded → auto-scan for badge)
//   background ──COLLECT_FINGERPRINT─▶ content     (page info + raw evidence)
//   popup      ──SCAN_TAB────────────▶ background  (full scan: fingerprint + JS + headers → detect)
//   popup      ──GET_TAB_DATA────────▶ background  (cached result, instant render)
//
// Every response has the shape { ok: true, data } | { ok: false, error: { code, message } }.
export const MSG = Object.freeze({
  PAGE_READY: "PAGE_READY",
  COLLECT_FINGERPRINT: "COLLECT_FINGERPRINT",
  SCAN_TAB: "SCAN_TAB",
  GET_TAB_DATA: "GET_TAB_DATA"
});

export const ERROR = Object.freeze({
  RESTRICTED_PAGE: "RESTRICTED_PAGE",
  NO_TAB: "NO_TAB",
  SCAN_FAILED: "SCAN_FAILED"
});

export const ok = (data) => ({ ok: true, data });
export const fail = (code, message) => ({ ok: false, error: { code, message } });
