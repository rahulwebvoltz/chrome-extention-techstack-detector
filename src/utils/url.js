// Pages where Chrome forbids extensions from running scripts.
const RESTRICTED_PROTOCOLS = ["chrome:", "chrome-extension:", "edge:", "about:", "view-source:", "devtools:", "file:"];
const RESTRICTED_HOSTS = ["chromewebstore.google.com"];

export function isRestrictedUrl(url) {
  if (!url) return true;
  try {
    const { protocol, hostname, pathname } = new URL(url);
    if (RESTRICTED_PROTOCOLS.includes(protocol)) return true;
    if (hostname === "chrome.google.com") return pathname.startsWith("/webstore");
    return RESTRICTED_HOSTS.includes(hostname);
  } catch {
    return true;
  }
}

export function formatRelativeTime(timestamp, now = Date.now()) {
  const seconds = Math.round((now - timestamp) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}
