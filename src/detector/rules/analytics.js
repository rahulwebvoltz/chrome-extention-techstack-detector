export default [
  {
    name: "Google Analytics",
    category: "analytics",
    website: "https://marketingplatform.google.com/about/analytics/",
    color: "#e37400",
    scriptSrc: [
      { pattern: /googletagmanager\.com\/gtag\/js\?id=G-/i, weight: 100 },
      { pattern: /google-analytics\.com\/(?:ga|analytics)\.js/i, weight: 100 }
    ],
    html: [{ pattern: /gtag\(\s*['"]config['"]\s*,\s*['"]G-[A-Z0-9]+/i, weight: 80 }],
    cookies: { _ga: true, "_ga_*": true },
    js: { GoogleAnalyticsObject: { weight: 70 } }
  },
  {
    name: "Google Tag Manager",
    category: "tagManager",
    website: "https://tagmanager.google.com",
    color: "#246fdb",
    scriptSrc: [{ pattern: /googletagmanager\.com\/gtm\.js/i, weight: 100 }],
    html: [{ pattern: /googletagmanager\.com\/(?:gtm\.js|ns\.html)\?id=GTM-/i, weight: 90 }],
    js: { google_tag_manager: { weight: 90 } }
  },
  {
    name: "Hotjar",
    category: "analytics",
    website: "https://www.hotjar.com",
    color: "#fd3a5c",
    scriptSrc: [{ pattern: /static\.hotjar\.com/i, weight: 100 }],
    js: { _hjSettings: { weight: 90 }, hj: { weight: 30 } }
  },
  {
    name: "Mixpanel",
    category: "analytics",
    website: "https://mixpanel.com",
    color: "#7856ff",
    scriptSrc: [{ pattern: /cdn\.mxpnl\.com|mixpanel(?:-\d+\.\d+)?(?:\.min)?\.js/i, weight: 90 }],
    js: { "mixpanel.__SV": { weight: 90 } }
  },
  {
    name: "PostHog",
    category: "analytics",
    website: "https://posthog.com",
    color: "#f54e00",
    scriptSrc: [{ pattern: /(?:[a-z]+\.)?i\.posthog\.com|posthog\.com\/static\/array\.js/i, weight: 90 }],
    js: { "posthog.__loaded": { weight: 90 }, posthog: { weight: 40 } },
    cookies: { "ph_*": true }
  },
  {
    name: "Meta Pixel",
    category: "analytics",
    website: "https://www.facebook.com/business/tools/meta-pixel",
    color: "#0866ff",
    scriptSrc: [{ pattern: /connect\.facebook\.net\/[^/]+\/fbevents\.js/i, weight: 100 }],
    js: { fbq: { weight: 80 } },
    cookies: { _fbp: { weight: 50 } }
  },
  {
    name: "Microsoft Clarity",
    category: "analytics",
    website: "https://clarity.microsoft.com",
    color: "#2f6fde",
    scriptSrc: [{ pattern: /clarity\.ms\/tag\//i, weight: 100 }],
    js: { clarity: { weight: 50 } }
  },
  {
    name: "Pendo",
    category: "analytics",
    website: "https://www.pendo.io",
    color: "#ec2059",
    scriptSrc: [{ pattern: /cdn\.(?:eu\.)?pendo\.io\/agent\/static\//i, weight: 100 }],
    // pendo.VERSION looks like "2.346.0_prod-io"
    js: { "pendo.VERSION": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } }
  },
  {
    name: "Vercel Analytics",
    category: "analytics",
    website: "https://vercel.com/analytics",
    color: "#000000",
    implies: ["Vercel"],
    scriptSrc: [{ pattern: /\/_vercel\/insights\/script\.js|va\.vercel-scripts\.com\/v\d\/script/i, weight: 100 }],
    xhr: [{ pattern: /\/_vercel\/insights\/(?:view|event)/i, weight: 100 }],
    // @vercel/analytics client queue
    js: { vaq: { weight: 80 }, vam: { weight: 60 }, va: { weight: 40 } }
  },
  {
    name: "Vercel Speed Insights",
    category: "monitoring",
    website: "https://vercel.com/docs/speed-insights",
    color: "#000000",
    implies: ["Vercel"],
    scriptSrc: [{ pattern: /\/_vercel\/speed-insights\/script\.js|va\.vercel-scripts\.com\/v\d\/speed-insights/i, weight: 100 }],
    xhr: [{ pattern: /\/_vercel\/speed-insights\/vitals/i, weight: 100 }],
    js: { siq: { weight: 60 } }
  },
  {
    name: "Amplitude",
    category: "analytics",
    website: "https://amplitude.com",
    color: "#1e61f0",
    scriptSrc: [{ pattern: /cdn\.amplitude\.com\//i, weight: 100 }],
    js: { amplitude: { weight: 60 } }
  },
  {
    name: "Matomo",
    category: "analytics",
    website: "https://matomo.org",
    color: "#3152a0",
    scriptSrc: [{ pattern: /\/(?:matomo|piwik)\.js(?:[?#]|$)|cdn\.matomo\.cloud/i, weight: 90 }],
    html: [{ pattern: /_paq\.push\(/, weight: 60 }],
    js: { Matomo: { weight: 80 }, Piwik: { weight: 70 } },
    cookies: { "_pk_id*": { weight: 70 } }
  },
  {
    name: "Segment",
    category: "analytics",
    website: "https://segment.com",
    color: "#52bd94",
    scriptSrc: [{ pattern: /cdn\.segment\.(?:com|io)\/analytics\.js/i, weight: 100 }],
    js: { "analytics.SNIPPET_VERSION": { weight: 70 } },
    cookies: { ajs_anonymous_id: { weight: 70 } }
  },
  {
    name: "Heap",
    category: "analytics",
    website: "https://www.heap.io",
    color: "#7a3df5",
    scriptSrc: [{ pattern: /cdn\.(?:us\.)?heapanalytics\.com/i, weight: 100 }],
    js: { "heap.appid": { weight: 90 } }
  },
  {
    name: "Plausible",
    category: "analytics",
    website: "https://plausible.io",
    color: "#5850ec",
    scriptSrc: [{ pattern: /plausible\.io\/js\//i, weight: 100 }],
    js: { plausible: { weight: 60 } }
  },
  {
    name: "FullStory",
    category: "analytics",
    website: "https://www.fullstory.com",
    color: "#7b61ff",
    scriptSrc: [{ pattern: /(?:edge|rs)\.fullstory\.com|fullstory\.com\/s\/fs\.js/i, weight: 100 }],
    js: { _fs_namespace: { weight: 90 } }
  },
  {
    name: "LinkedIn Insight Tag",
    category: "analytics",
    website: "https://business.linkedin.com/marketing-solutions/insight-tag",
    color: "#0a66c2",
    scriptSrc: [{ pattern: /snap\.licdn\.com\/li\.lms-analytics\/insight/i, weight: 100 }],
    js: { _linkedin_partner_id: { weight: 90 }, _linkedin_data_partner_ids: { weight: 90 } }
  },
  {
    name: "TikTok Pixel",
    category: "analytics",
    website: "https://ads.tiktok.com/help/article/tiktok-pixel",
    color: "#ee1d52",
    scriptSrc: [{ pattern: /analytics\.tiktok\.com\/i18n\/pixel/i, weight: 100 }],
    js: { ttq: { weight: 70 } }
  },
  {
    name: "HubSpot",
    category: "marketing",
    website: "https://www.hubspot.com",
    color: "#ff7a59",
    scriptSrc: [{ pattern: /js\.(?:hs-scripts|hs-analytics|hsforms|hs-banner)\.(?:com|net)/i, weight: 100 }],
    js: { _hsq: { weight: 70 } },
    cookies: { hubspotutk: { weight: 80 } }
  }
];
