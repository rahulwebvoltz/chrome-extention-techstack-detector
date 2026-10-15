// Mostly header-based: these only show up in HTTP response headers, which
// the service worker captures via chrome.webRequest.
export default [
  {
    name: "Cloudflare",
    category: "cdn",
    website: "https://www.cloudflare.com",
    color: "#f38020",
    headers: { server: /^cloudflare$/i, "cf-ray": true, "cf-cache-status": { weight: 90 } },
    cookies: { __cf_bm: { weight: 80 }, cf_clearance: { weight: 80 } },
    scriptSrc: [{ pattern: /\/cdn-cgi\//i, weight: 60 }]
  },
  {
    name: "Amazon CloudFront",
    category: "cdn",
    website: "https://aws.amazon.com/cloudfront/",
    color: "#8c4fff",
    implies: ["Amazon Web Services"],
    headers: { "x-amz-cf-id": true, "x-amz-cf-pop": true, via: /CloudFront/i }
  },
  {
    name: "Fastly",
    category: "cdn",
    website: "https://www.fastly.com",
    color: "#ff282d",
    headers: {
      "x-fastly-request-id": true,
      "fastly-debug-digest": true,
      "x-served-by": { pattern: /^cache-/i, weight: 60 },
      // Varnish timing header as Fastly formats it: S<start>,VS0,VE<ms>
      "x-timer": { pattern: /^S\d+\.\d+,VS\d+,VE\d+/, weight: 80 }
    }
  },
  {
    name: "Akamai",
    category: "cdn",
    website: "https://www.akamai.com",
    color: "#0096d6",
    headers: { "x-akamai-transformed": true, server: /AkamaiGHost/i, "akamai-grn": true }
  },
  // Public CDNs. A file actually loaded from them is proof; a bare
  // dns-prefetch/preconnect hint (href="//unpkg.com") only says the page
  // expects to use it, so it scores "likely".
  publicCdn("jsDelivr", "cdn\\.jsdelivr\\.net", { website: "https://www.jsdelivr.com", color: "#e84d3d" }),
  publicCdn("cdnjs", "cdnjs\\.cloudflare\\.com", { website: "https://cdnjs.com", color: "#d9643a" }),
  publicCdn("unpkg", "unpkg\\.com", { website: "https://unpkg.com", color: "#333333" }),
  {
    name: "Google Hosted Libraries",
    category: "cdn",
    website: "https://developers.google.com/speed/libraries",
    color: "#4285f4",
    scriptSrc: [{ pattern: /\/\/ajax\.googleapis\.com\/ajax\/libs\//i, weight: 100 }],
    links: [{ pattern: /\/\/ajax\.googleapis\.com\/ajax\/libs\//i, weight: 100 }]
  }
];

function publicCdn(name, host, { website, color }) {
  const file = new RegExp(`//${host}/[^\\s"']+`, "i");
  return {
    name,
    category: "cdn",
    website,
    color,
    scriptSrc: [{ pattern: file, weight: 100 }],
    links: [{ pattern: file, weight: 100 }],
    html: [
      {
        pattern: new RegExp(
          `<link[^>]+(?:dns-prefetch|preconnect)[^>]+(?:https?:)?//${host}|<link[^>]+(?:https?:)?//${host}[^>]+(?:dns-prefetch|preconnect)`,
          "i"
        ),
        weight: 60
      }
    ]
  };
}
