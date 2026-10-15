import { fail } from "../shared/messages.js";

// Promise wrapper for popup → background messages. Always resolves with the
// standard { ok, data | error } shape, so callers never need try/catch.
export async function sendToBackground(type, payload) {
  try {
    const response = await chrome.runtime.sendMessage({ type, payload });
    return response ?? fail("NO_RESPONSE", "Background did not respond.");
  } catch (err) {
    return fail("MESSAGE_FAILED", err.message);
  }
}

export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}
