import { MSG, ERROR, ok, fail } from "../shared/messages.js";
import { storage } from "../services/chromeStorage.js";
import { tabCache } from "../services/tabCache.js";
import { headerStore } from "../services/headerStore.js";
import { requestStore, TRACKED_TYPES } from "../services/requestStore.js";
import { isRestrictedUrl } from "../utils/url.js";
import { detector } from "../detector/index.js";
import { probeMainWorld } from "../detector/scanners/jsScanner.js";

chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.log(`[TechStack] ${reason} — ${detector.rules.length} technology rules loaded`);
});

// ---------- header capture ----------

chrome.webRequest.onHeadersReceived.addListener(
  ({ tabId, url, responseHeaders }) => {
    if (tabId >= 0) headerStore.set(tabId, url, responseHeaders);
  },
  { urls: ["http://*/*", "https://*/*"], types: ["main_frame"] },
  ["responseHeaders"]
);

// ---------- request tracking ----------

chrome.webRequest.onBeforeRequest.addListener(
  ({ tabId, frameId, type, url }) => {
    if (tabId < 0) return;
    if (type === "main_frame") requestStore.reset(tabId);
    // Only the page's own requests — what an embedded iframe (YouTube player,
    // ad frame…) loads internally is that third party's stack, not the site's.
    else if (frameId === 0) requestStore.add(tabId, type, url);
  },
  { urls: ["http://*/*", "https://*/*"], types: ["main_frame", ...TRACKED_TYPES] }
);

const mergeUnique = (...lists) => [...new Set(lists.flat().filter(Boolean))];

// ---------- scanning ----------

async function collectFromContent(tabId) {
  const message = { type: MSG.COLLECT_FINGERPRINT, payload: { probe: detector.probe } };
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    // No content script in this tab (opened before install, or extension
    // reloaded) — inject it and retry.
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
    return chrome.tabs.sendMessage(tabId, message);
  }
}

async function collectFromMainWorld(tabId) {
  try {
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      func: probeMainWorld,
      args: [detector.probe.js, detector.probe.expando, detector.probe.jsPrefix]
    });
    return injection?.result ?? {};
  } catch {
    return {}; // e.g. page CSP or navigation mid-scan — continue with other signals
  }
}

// document.cookie can't see HttpOnly cookies — and backend session cookies
// (laravel_session, JSESSIONID, ASP.NET_SessionId…) are usually HttpOnly.
// Only names are kept; values are never read into the result.
async function collectCookieNames(url) {
  try {
    const cookies = await chrome.cookies.getAll({ url });
    return Object.fromEntries(cookies.map((c) => [c.name, ""]));
  } catch {
    return {};
  }
}

async function runScan(tabId) {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab) return fail(ERROR.NO_TAB, "Tab no longer exists.");
  if (isRestrictedUrl(tab.url)) {
    return fail(ERROR.RESTRICTED_PAGE, "Chrome doesn't allow extensions to read this page.");
  }

  const started = performance.now();
  try {
    const [content, mainWorld] = await Promise.all([collectFromContent(tabId), collectFromMainWorld(tabId)]);
    if (!content?.ok) return fail(ERROR.SCAN_FAILED, "Content script returned no data.");

    const { page, fingerprint } = content.data;
    const [headers, cookieNames, network] = await Promise.all([
      headerStore.get(tabId, page.url),
      collectCookieNames(page.url),
      requestStore.get(tabId)
    ]);
    const technologies = detector.detect({
      ...fingerprint,
      ...mainWorld,
      headers,
      cookies: { ...cookieNames, ...fingerprint.cookies },
      // DOM-visible URLs plus everything the tab actually requested
      scriptSrc: mergeUnique(fingerprint.scriptSrc, network.scripts),
      links: mergeUnique(fingerprint.links, network.styles),
      requests: mergeUnique(fingerprint.requests, network.requests, network.frames)
    });

    const result = {
      ...page,
      technologies,
      signals: { headers: Object.keys(headers).length > 0 },
      scanDurationMs: Math.round(performance.now() - started)
    };
    await saveScan(tabId, result);
    return ok(result);
  } catch (err) {
    return fail(ERROR.SCAN_FAILED, err.message);
  }
}

// Collapse concurrent scans of the same tab (auto-scan + popup open) into one.
const inFlight = new Map();
function scanTab(tabId) {
  if (!inFlight.has(tabId)) {
    inFlight.set(tabId, runScan(tabId).finally(() => inFlight.delete(tabId)));
  }
  return inFlight.get(tabId);
}

async function saveScan(tabId, result) {
  await tabCache.set(tabId, result);
  await storage.set("lastScan", { hostname: result.hostname, url: result.url, scannedAt: result.scannedAt });

  const count = result.technologies.length;
  await chrome.action.setBadgeBackgroundColor({ tabId, color: "#6366f1" }).catch(() => {});
  await chrome.action.setBadgeTextColor({ tabId, color: "#ffffff" }).catch(() => {});
  await chrome.action.setBadgeText({ tabId, text: count ? String(count) : "" }).catch(() => {});
}

// ---------- message router ----------

const handlers = {
  [MSG.PAGE_READY]: async (_payload, sender) => {
    if (!sender.tab?.id) return fail(ERROR.NO_TAB, "Sender is not a tab.");
    scanTab(sender.tab.id); // fire and forget — result lands in the cache
    return ok(null);
  },
  [MSG.SCAN_TAB]: ({ tabId }) => scanTab(tabId),
  [MSG.GET_TAB_DATA]: async ({ tabId }) => ok((await tabCache.get(tabId)) ?? null)
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handler = handlers[message?.type];
  if (!handler) return false;

  Promise.resolve(handler(message.payload ?? {}, sender))
    .catch((err) => fail(ERROR.SCAN_FAILED, err.message))
    .then(sendResponse);

  return true; // keep the channel open for the async response
});

// ---------- tab lifecycle ----------

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // New navigation → old results no longer apply.
  if (changeInfo.status === "loading" && changeInfo.url) tabCache.remove(tabId);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabCache.remove(tabId);
  headerStore.remove(tabId);
  requestStore.remove(tabId);
});
