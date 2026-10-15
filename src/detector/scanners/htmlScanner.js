// Full HTML can be several MB on heavy pages; the head and early body carry
// almost every fingerprint, so cap what we ship to the service worker.
const MAX_HTML_LENGTH = 500_000;

export function scanHtml() {
  const html = document.documentElement.outerHTML;
  return html.length > MAX_HTML_LENGTH ? html.slice(0, MAX_HTML_LENGTH) : html;
}
