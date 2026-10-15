// Cookie name → value from document.cookie (HttpOnly cookies aren't visible
// here, but most technology-identifying cookies are not HttpOnly).
export function scanCookies() {
  const cookies = {};
  for (const pair of document.cookie.split(";")) {
    const eq = pair.indexOf("=");
    const name = (eq === -1 ? pair : pair.slice(0, eq)).trim();
    if (name) cookies[name] = eq === -1 ? "" : pair.slice(eq + 1).trim();
  }
  return cookies;
}
