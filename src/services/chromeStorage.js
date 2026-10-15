// Thin promise-based wrapper over chrome.storage.
// `local`   — persists across browser restarts (settings, last scan, later: history)
// `session` — in-memory, cleared when the browser closes (per-tab scan cache)
function createStore(area) {
  return {
    async get(key) {
      const result = await chrome.storage[area].get(key);
      return result[key];
    },
    async set(key, value) {
      await chrome.storage[area].set({ [key]: value });
    },
    async remove(key) {
      await chrome.storage[area].remove(key);
    }
  };
}

export const storage = createStore("local");
export const sessionStorage = createStore("session");
