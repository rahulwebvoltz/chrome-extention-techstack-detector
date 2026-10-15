import { MSG, ok } from "../shared/messages.js";
import { scanPage } from "./pageScanner.js";
import { collectFingerprint } from "../detector/scanners/collectFingerprint.js";

// The background may inject this file programmatically into tabs that were
// open before the extension was installed. Guard against registering twice.
if (!globalThis.__techstackContentLoaded) {
  globalThis.__techstackContentLoaded = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === MSG.COLLECT_FINGERPRINT) {
      sendResponse(ok({ page: scanPage(), fingerprint: collectFingerprint(message.payload?.probe) }));
    }
    // Synchronous response — no need to keep the channel open.
    return false;
  });

  // Let the background scan this page so the toolbar badge shows a count.
  const notifyReady = () => {
    try {
      chrome.runtime.sendMessage({ type: MSG.PAGE_READY }).catch(() => {});
    } catch {
      // Extension was reloaded/updated; this orphaned script can no longer talk to it.
    }
  };
  notifyReady();

  // Many sites delay their JS until the first interaction (LiteSpeed, WP
  // Rocket…). Scan once more shortly after it, when those scripts have run.
  const INTERACTION_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove", "wheel"];
  const onFirstInteraction = () => {
    INTERACTION_EVENTS.forEach((e) => removeEventListener(e, onFirstInteraction, true));
    setTimeout(notifyReady, 2500);
  };
  INTERACTION_EVENTS.forEach((e) => addEventListener(e, onFirstInteraction, { capture: true, passive: true }));

  // Apps often render after `document_idle` (loading screens, client-side
  // redirects, lazy widgets like chat/analytics). Scan again once settled.
  setTimeout(notifyReady, 4000);

  // Single-page apps change route without a page load — rescan on navigation.
  // (Navigation API; Chrome 102+. Debounced so redirects collapse into one.)
  let routeTimer;
  globalThis.navigation?.addEventListener("navigatesuccess", () => {
    clearTimeout(routeTimer);
    routeTimer = setTimeout(notifyReady, 1500);
  });
}
