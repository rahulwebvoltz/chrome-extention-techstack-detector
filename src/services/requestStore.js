import { sessionStorage } from "./chromeStorage.js";

// Network requests made by each tab, observed via chrome.webRequest. This
// sees what the DOM no longer shows: scripts that removed their own <script>
// tag, CSS @imports, fonts, and XHR/fetch calls to APIs (e.g. ip-api.com).
//
// Kept in memory for speed and mirrored to session storage (debounced) so a
// service-worker restart doesn't lose it.

const MAX_PER_KIND = 300;
const KIND_BY_TYPE = {
  script: "scripts",
  stylesheet: "styles",
  font: "styles",
  xmlhttprequest: "requests",
  ping: "requests",
  other: "requests",
  sub_frame: "frames"
};
export const TRACKED_TYPES = Object.keys(KIND_BY_TYPE);

const keyFor = (tabId) => `requests:${tabId}`;
const empty = () => ({ scripts: [], styles: [], requests: [], frames: [] });

const memory = new Map(); // tabId → { scripts:Set, styles:Set, requests:Set, frames:Set }
const pendingSave = new Map();

function bucket(tabId) {
  if (!memory.has(tabId)) {
    memory.set(tabId, { scripts: new Set(), styles: new Set(), requests: new Set(), frames: new Set() });
  }
  return memory.get(tabId);
}

function scheduleSave(tabId) {
  clearTimeout(pendingSave.get(tabId));
  pendingSave.set(
    tabId,
    setTimeout(() => {
      pendingSave.delete(tabId);
      const b = memory.get(tabId);
      if (b) sessionStorage.set(keyFor(tabId), Object.fromEntries(Object.entries(b).map(([k, v]) => [k, [...v]])));
    }, 1000)
  );
}

export const requestStore = {
  // A new top-level navigation starts a fresh record for the tab.
  reset(tabId) {
    memory.delete(tabId);
    clearTimeout(pendingSave.get(tabId));
    return sessionStorage.remove(keyFor(tabId));
  },

  add(tabId, type, url) {
    const kind = KIND_BY_TYPE[type];
    if (!kind || url.startsWith("data:")) return;
    const set = bucket(tabId)[kind];
    if (set.size >= MAX_PER_KIND) return;
    set.add(url);
    scheduleSave(tabId);
  },

  async get(tabId) {
    const b = memory.get(tabId);
    if (b) return Object.fromEntries(Object.entries(b).map(([k, v]) => [k, [...v]]));
    return (await sessionStorage.get(keyFor(tabId))) ?? empty(); // worker was restarted
  },

  remove(tabId) {
    memory.delete(tabId);
    return sessionStorage.remove(keyFor(tabId));
  }
};
