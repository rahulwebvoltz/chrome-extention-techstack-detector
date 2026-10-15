// Runs in the page's MAIN world via chrome.scripting.executeScript({ func }).
// Content scripts live in an isolated world and can't see page globals
// (window.React, window.Shopify…) or JS properties React/Vue attach to DOM
// nodes — so this check has to run here.
//
// IMPORTANT: Chrome serializes this function's source, so it must be fully
// self-contained — no imports, no references to outer variables.
export function probeMainWorld(paths, expandoPrefixes, globalPrefixes = []) {
  const MAX_NODES = 600;

  // Globals with generated names, e.g. webpackChunk_my_app, __sveltekit_x1y2
  const jsPrefix = {};
  if (globalPrefixes.length) {
    for (const key of Object.keys(window)) {
      for (const prefix of globalPrefixes) {
        if (!jsPrefix[prefix] && key.startsWith(prefix)) jsPrefix[prefix] = key;
      }
    }
  }

  const js = {};
  for (const path of paths) {
    try {
      let value = window;
      for (const part of path.split(".")) {
        value = value == null ? undefined : value[part];
      }
      if (value === undefined || value === null) continue;
      const type = typeof value;
      // Only ship primitives back; objects/functions just mean "exists".
      js[path] = type === "string" ? value.slice(0, 200) : type === "number" || type === "boolean" ? value : true;
    } catch {
      // Getter threw or cross-origin access — treat as absent.
    }
  }

  const expando = {};
  if (expandoPrefixes.length && document.body) {
    const pending = new Set(expandoPrefixes);
    const nodes = [document.body, ...document.body.querySelectorAll("*")].slice(0, MAX_NODES);
    for (const node of nodes) {
      for (const key of Object.keys(node)) {
        for (const prefix of pending) {
          if (key.startsWith(prefix)) {
            expando[prefix] = true;
            pending.delete(prefix);
          }
        }
      }
      if (!pending.size) break;
    }
  }

  return { js, expando, jsPrefix };
}
