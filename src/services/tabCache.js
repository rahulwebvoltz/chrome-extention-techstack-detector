import { sessionStorage } from "./chromeStorage.js";

// Per-tab scan results. Lives in session storage so it survives the
// service worker being shut down and restarted by Chrome.
const keyFor = (tabId) => `tab:${tabId}`;

export const tabCache = {
  get: (tabId) => sessionStorage.get(keyFor(tabId)),
  set: (tabId, data) => sessionStorage.set(keyFor(tabId), data),
  remove: (tabId) => sessionStorage.remove(keyFor(tabId))
};
