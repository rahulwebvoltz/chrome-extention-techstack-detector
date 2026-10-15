import { sessionStorage } from "./chromeStorage.js";

// Response headers of each tab's main document, captured by chrome.webRequest.
// Content scripts can't read headers, so this is the only way to see
// signals like `server: cloudflare` or `x-vercel-id`.
const keyFor = (tabId) => `headers:${tabId}`;

export const headerStore = {
  async set(tabId, url, responseHeaders = []) {
    const headers = {};
    for (const { name, value } of responseHeaders) {
      const key = name.toLowerCase();
      headers[key] = key in headers ? `${headers[key]}, ${value}` : value ?? "";
    }
    await sessionStorage.set(keyFor(tabId), { url, headers });
  },

  // Only returns headers if they belong to the page currently in the tab.
  async get(tabId, pageUrl) {
    const entry = await sessionStorage.get(keyFor(tabId));
    if (!entry) return {};
    try {
      return new URL(entry.url).host === new URL(pageUrl).host ? entry.headers : {};
    } catch {
      return {};
    }
  },

  remove: (tabId) => sessionStorage.remove(keyFor(tabId))
};
