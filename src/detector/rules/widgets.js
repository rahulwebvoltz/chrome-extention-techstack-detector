// Third-party services embedded in pages: chat, consent, ads, maps,
// email marketing, social and other widgets.
export default [
  // ---------- Maps ----------
  {
    name: "Google Maps",
    category: "maps",
    website: "https://developers.google.com/maps",
    color: "#4285f4",
    scriptSrc: [{ pattern: /maps\.googleapis\.com\/maps\/api\/js/i, weight: 100 }],
    html: [{ pattern: /google\.com\/maps\/embed|maps\.google\.com\/maps\?[^"']*output=embed/i, weight: 90 }],
    js: { "google.maps": { weight: 90 } }
  },
  {
    name: "Leaflet",
    category: "maps",
    website: "https://leafletjs.com",
    color: "#199900",
    js: { "L.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    links: [{ pattern: /\/leaflet(?:@[\d.]+)?\/dist\/leaflet\.css|\/leaflet(?:\.min)?\.css/i, weight: 80 }]
  },
  {
    name: "Mapbox",
    category: "maps",
    website: "https://www.mapbox.com",
    color: "#4264fb",
    js: { "mapboxgl.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    scriptSrc: [{ pattern: /api\.mapbox\.com\/mapbox-gl-js\//i, weight: 90 }]
  },

  // ---------- Advertising ----------
  {
    name: "Google AdSense",
    category: "advertising",
    website: "https://adsense.google.com",
    color: "#4285f4",
    scriptSrc: [{ pattern: /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i, weight: 100 }],
    js: { adsbygoogle: { weight: 60 } }
  },
  {
    name: "Google Ads",
    category: "advertising",
    website: "https://ads.google.com",
    color: "#4285f4",
    scriptSrc: [
      { pattern: /googleadservices\.com\/pagead\/conversion/i, weight: 100 },
      { pattern: /googletagmanager\.com\/gtag\/js\?id=AW-/i, weight: 100 }
    ],
    html: [{ pattern: /gtag\(\s*['"]config['"]\s*,\s*['"]AW-\d+/i, weight: 90 }]
  },
  {
    name: "Google Publisher Tag",
    category: "advertising",
    website: "https://developers.google.com/publisher-tag",
    color: "#4285f4",
    scriptSrc: [{ pattern: /securepubads\.g\.doubleclick\.net\/tag\/js\/gpt\.js/i, weight: 100 }],
    js: { "googletag.apiReady": { weight: 70 } }
  },

  // ---------- Live chat ----------
  {
    name: "Intercom",
    category: "chat",
    website: "https://www.intercom.com",
    color: "#286efa",
    scriptSrc: [{ pattern: /widget\.intercom\.io|js\.intercomcdn\.com/i, weight: 100 }],
    js: { Intercom: { weight: 70 } }
  },
  {
    name: "Crisp",
    category: "chat",
    website: "https://crisp.chat",
    color: "#1972f5",
    scriptSrc: [{ pattern: /client\.crisp\.chat/i, weight: 100 }],
    js: { $crisp: { weight: 90 } }
  },
  {
    name: "Tawk.to",
    category: "chat",
    website: "https://www.tawk.to",
    color: "#03a84e",
    scriptSrc: [{ pattern: /embed\.tawk\.to/i, weight: 100 }],
    js: { Tawk_API: { weight: 90 } }
  },
  {
    name: "Zendesk",
    category: "chat",
    website: "https://www.zendesk.com",
    color: "#03363d",
    scriptSrc: [{ pattern: /static\.zdassets\.com\/ekr\/snippet\.js/i, weight: 100 }],
    js: { zE: { weight: 60 } }
  },
  {
    name: "Tidio",
    category: "chat",
    website: "https://www.tidio.com",
    color: "#0566ff",
    scriptSrc: [{ pattern: /code\.tidio\.co/i, weight: 100 }],
    js: { tidioChatApi: { weight: 90 } }
  },
  {
    name: "LiveChat",
    category: "chat",
    website: "https://www.livechat.com",
    color: "#ff5100",
    scriptSrc: [{ pattern: /cdn\.livechatinc\.com/i, weight: 100 }],
    js: { LiveChatWidget: { weight: 90 } }
  },
  {
    name: "Zoho SalesIQ",
    category: "chat",
    website: "https://www.zoho.com/salesiq/",
    color: "#e42527",
    // Regional data centres: zoho.com / .in / .eu / .com.au / .jp / .com.cn
    scriptSrc: [{ pattern: /salesiq\.zoho\.(?:com|in|eu|com\.au|jp|com\.cn)\/widget|static\.zohocdn\.com\/salesiq\//i, weight: 100 }],
    html: [{ pattern: /<script[^>]+id=["']zsiqscript["']/i, weight: 90 }],
    js: { "$zoho.salesiq": { weight: 90 } }
  },
  {
    name: "Drift",
    category: "chat",
    website: "https://www.salesloft.com/platform/drift",
    color: "#0176ff",
    scriptSrc: [{ pattern: /js\.driftt\.com/i, weight: 100 }],
    js: { "drift.SNIPPET_VERSION": { weight: 90 } }
  },

  // ---------- Cookie compliance ----------
  {
    name: "Cookiebot",
    category: "consent",
    website: "https://www.cookiebot.com",
    color: "#1032cf",
    scriptSrc: [{ pattern: /consent(?:cdn)?\.cookiebot\.(?:com|eu)/i, weight: 100 }],
    js: { Cookiebot: { weight: 80 } }
  },
  {
    name: "OneTrust",
    category: "consent",
    website: "https://www.onetrust.com",
    color: "#6cc04a",
    scriptSrc: [{ pattern: /cdn\.cookielaw\.org|optanon\.blob\.core\.windows\.net|otSDKStub\.js/i, weight: 100 }],
    js: { OneTrust: { weight: 80 } },
    cookies: { OptanonConsent: { weight: 80 } }
  },
  {
    name: "CookieYes",
    category: "consent",
    website: "https://www.cookieyes.com",
    color: "#0056a7",
    scriptSrc: [{ pattern: /cdn-cookieyes\.com/i, weight: 100 }],
    cookies: { "cookieyes-consent": { weight: 90 } }
  },
  {
    name: "Usercentrics",
    category: "consent",
    website: "https://usercentrics.com",
    color: "#0045a5",
    scriptSrc: [{ pattern: /(?:app|web\.cmp)\.usercentrics\.eu/i, weight: 100 }]
  },
  {
    name: "Osano",
    category: "consent",
    website: "https://www.osano.com",
    color: "#7764fa",
    scriptSrc: [{ pattern: /cmp\.osano\.com/i, weight: 100 }],
    js: { Osano: { weight: 80 } }
  },

  // ---------- Email / push marketing ----------
  {
    name: "Mailchimp",
    category: "marketing",
    website: "https://mailchimp.com",
    color: "#ffe01b",
    scriptSrc: [{ pattern: /chimpstatic\.com|list-manage\.com/i, weight: 100 }],
    html: [{ pattern: /action=["'][^"']*\.list-manage\.com\/subscribe/i, weight: 90 }]
  },
  {
    name: "Klaviyo",
    category: "marketing",
    website: "https://www.klaviyo.com",
    color: "#232426",
    scriptSrc: [{ pattern: /static(?:-tracking)?\.klaviyo\.com/i, weight: 100 }],
    js: { klaviyo: { weight: 70 } }
  },
  {
    name: "OneSignal",
    category: "marketing",
    website: "https://onesignal.com",
    color: "#e54b4d",
    scriptSrc: [{ pattern: /cdn\.onesignal\.com/i, weight: 100 }],
    js: { OneSignal: { weight: 80 } }
  },

  // ---------- Fonts ----------
  {
    name: "Adobe Fonts",
    category: "fonts",
    website: "https://fonts.adobe.com",
    color: "#eb1000",
    links: [{ pattern: /use\.typekit\.net/i, weight: 100 }],
    scriptSrc: [{ pattern: /use\.typekit\.net/i, weight: 100 }]
  },
  {
    name: "Bunny Fonts",
    category: "fonts",
    website: "https://fonts.bunny.net",
    color: "#ff7854",
    links: [{ pattern: /fonts\.bunny\.net/i, weight: 100 }]
  },

  // ---------- Widgets ----------
  {
    name: "Trustpilot",
    category: "widgets",
    website: "https://www.trustpilot.com",
    color: "#00b67a",
    scriptSrc: [{ pattern: /widget\.trustpilot\.com/i, weight: 100 }],
    html: [{ pattern: /class=["'][^"']*\btrustpilot-widget\b/i, weight: 80 }]
  },
  {
    name: "Calendly",
    category: "widgets",
    website: "https://calendly.com",
    color: "#006bff",
    scriptSrc: [{ pattern: /assets\.calendly\.com/i, weight: 100 }],
    html: [{ pattern: /class=["'][^"']*\bcalendly-inline-widget\b/i, weight: 80 }]
  },
  {
    name: "X (Twitter) widgets",
    category: "widgets",
    website: "https://developer.x.com/en/docs/x-for-websites",
    color: "#000000",
    scriptSrc: [{ pattern: /platform\.twitter\.com\/widgets\.js/i, weight: 100 }]
  },
  {
    name: "Facebook SDK",
    category: "widgets",
    website: "https://developers.facebook.com/docs/javascript",
    color: "#0866ff",
    scriptSrc: [{ pattern: /connect\.facebook\.net\/[^/]+\/(?:sdk|all)\.js/i, weight: 100 }],
    js: { "FB.init": { weight: 70 } }
  },
  {
    name: "AddToAny",
    category: "widgets",
    website: "https://www.addtoany.com",
    color: "#0166ff",
    scriptSrc: [{ pattern: /static\.addtoany\.com/i, weight: 100 }]
  },
  {
    name: "ShareThis",
    category: "widgets",
    website: "https://sharethis.com",
    color: "#95d03a",
    scriptSrc: [{ pattern: /(?:platform-api|buttons-config)\.sharethis\.com/i, weight: 100 }]
  },
  {
    name: "Disqus",
    category: "widgets",
    website: "https://disqus.com",
    color: "#2e9fff",
    scriptSrc: [{ pattern: /\.disqus\.com\/(?:embed|count)\.js/i, weight: 100 }],
    dom: { "#disqus_thread": { weight: 80 } }
  }
];
