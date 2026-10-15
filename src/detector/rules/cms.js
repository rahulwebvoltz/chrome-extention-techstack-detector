export default [
  {
    name: "WordPress",
    category: "cms",
    website: "https://wordpress.org",
    color: "#21759b",
    implies: ["PHP", "MySQL"],
    meta: { generator: { pattern: /^WordPress ?([\d.]+)?/i, version: "\\1" } },
    html: [
      { pattern: /<link[^>]+rel=["']https:\/\/api\.w\.org\/["']/i, weight: 80 },
      { pattern: /\/wp-content\/(?:themes|plugins|uploads)\//i, weight: 50 },
      { pattern: /\/wp-includes\//i, weight: 50 }
    ],
    scriptSrc: [{ pattern: /\/wp-includes\/js\//i, weight: 60 }],
    js: { wp: { weight: 30 }, wpApiSettings: { weight: 60 } }
  },
  {
    name: "Drupal",
    category: "cms",
    website: "https://www.drupal.org",
    color: "#0678be",
    implies: ["PHP"],
    meta: { generator: { pattern: /^Drupal ?(\d+)?/i, version: "\\1" } },
    headers: {
      "x-generator": { pattern: /^Drupal ?(\d+)?/i, version: "\\1" },
      "x-drupal-cache": { weight: 80 },
      "x-drupal-dynamic-cache": { weight: 80 }
    },
    html: [{ pattern: /\/sites\/(?:default|all)\/(?:files|themes|modules)\//i, weight: 40 }],
    scriptSrc: [/\/core\/misc\/drupal\.js|\/misc\/drupal\.js/i],
    js: { Drupal: { weight: 80 }, drupalSettings: { weight: 80 } }
  },
  {
    name: "Joomla",
    category: "cms",
    website: "https://www.joomla.org",
    color: "#5091cd",
    implies: ["PHP"],
    meta: { generator: /Joomla!/i },
    html: [{ pattern: /\/media\/(?:jui|system\/js)\//i, weight: 40 }],
    js: { Joomla: { weight: 80 } }
  },
  {
    name: "Ghost",
    category: "cms",
    website: "https://ghost.org",
    color: "#15171a",
    meta: { generator: { pattern: /^Ghost ?([\d.]+)?/i, version: "\\1" } },
    headers: { "x-ghost-cache-status": { weight: 80 } },
    scriptSrc: [{ pattern: /\/ghost\/(?:portal|sodo-search)|portal\.min\.js/i, weight: 50 }]
  },
  {
    name: "Webflow",
    category: "cms",
    website: "https://webflow.com",
    color: "#4353ff",
    meta: { generator: /Webflow/i },
    html: [{ pattern: /<html[^>]+data-wf-(?:page|site)=/i, weight: 90 }],
    scriptSrc: [/assets\.website-files\.com|webflow\.[a-z0-9]+\.js/i],
    js: { Webflow: { weight: 70 } }
  },
  {
    name: "Wix",
    category: "cms",
    website: "https://www.wix.com",
    color: "#0c6efc",
    meta: { generator: /Wix\.com Website Builder/i },
    headers: { "x-wix-request-id": true },
    scriptSrc: [{ pattern: /static\.parastorage\.com/i, weight: 70 }],
    html: [/static\.wixstatic\.com/i]
  },
  {
    name: "Squarespace",
    category: "cms",
    website: "https://www.squarespace.com",
    color: "#121212",
    headers: { server: /Squarespace/i },
    html: [{ pattern: /static1\.squarespace\.com|<!-- This is Squarespace\. -->/i, weight: 70 }],
    js: { Squarespace: { weight: 90 } }
  },
  {
    name: "Framer",
    category: "cms",
    website: "https://www.framer.com",
    color: "#0055ff",
    meta: { generator: /^Framer\b/i },
    html: [{ pattern: /framerusercontent\.com/i, weight: 70 }],
    js: { __framer_importFromPackage: { weight: 80 } }
  },
  {
    name: "Duda",
    category: "cms",
    website: "https://www.duda.co",
    color: "#0a1f44",
    html: [{ pattern: /(?:l?irp(?:-cdn)?\.(?:multiscreensite|cdn-website)\.com)/i, weight: 90 }],
    js: { dmAPI: { weight: 80 } }
  },
  {
    name: "HubSpot CMS",
    category: "cms",
    website: "https://www.hubspot.com/products/cms",
    color: "#ff7a59",
    implies: ["HubSpot"],
    meta: { generator: /HubSpot/i },
    headers: { "x-hs-hub-id": { weight: 80 } },
    html: [{ pattern: /\/hs-fs\/hubfs\/|\.hubspotusercontent(?:-[a-z0-9]+)?\.net\/hubfs\//i, weight: 60 }]
  },
  {
    name: "TYPO3",
    category: "cms",
    website: "https://typo3.org",
    color: "#ff8700",
    implies: ["PHP"],
    meta: { generator: { pattern: /TYPO3(?: CMS)?(?: ([\d.]+))?/i, version: "\\1" } },
    html: [{ pattern: /\/typo3(?:temp|conf)\//i, weight: 60 }]
  },
  {
    name: "Blogger",
    category: "cms",
    website: "https://www.blogger.com",
    color: "#ff5722",
    meta: { generator: /^Blogger$/i },
    html: [{ pattern: /(?:www\.)?blogger\.com\/static\/|\.blogspot\.com\//i, weight: 40 }],
    js: { _WidgetManager: { weight: 80 } }
  },

  // ---------- Headless CMS (identified by their asset CDNs) ----------
  {
    name: "Contentful",
    category: "cms",
    website: "https://www.contentful.com",
    color: "#2478cc",
    html: [{ pattern: /\b(?:images|assets|videos|downloads)\.ctfassets\.net\//i, weight: 90 }]
  },
  {
    name: "Sanity",
    category: "cms",
    website: "https://www.sanity.io",
    color: "#f03e2f",
    html: [{ pattern: /cdn\.sanity\.io\/(?:images|files)\//i, weight: 90 }]
  },
  {
    name: "Strapi",
    category: "cms",
    website: "https://strapi.io",
    color: "#4945ff",
    headers: { "x-powered-by": /Strapi/i },
    html: [{ pattern: /[a-z0-9-]+\.media\.strapiapp\.com/i, weight: 90 }]
  }
];
