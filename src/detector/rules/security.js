export default [
  // ---------- Bot protection / CAPTCHA ----------
  {
    name: "Cloudflare Turnstile",
    category: "security",
    website: "https://www.cloudflare.com/products/turnstile/",
    color: "#f38020",
    scriptSrc: [{ pattern: /challenges\.cloudflare\.com\/turnstile\//i, weight: 100 }],
    dom: { ".cf-turnstile": { weight: 80 } }
  },
  {
    name: "hCaptcha",
    category: "security",
    website: "https://www.hcaptcha.com",
    color: "#0074bf",
    scriptSrc: [{ pattern: /(?:js\.)?hcaptcha\.com\/1\/api\.js/i, weight: 100 }],
    dom: { ".h-captcha": { weight: 80 } },
    js: { hcaptcha: { weight: 60 } }
  },
  {
    name: "reCAPTCHA",
    category: "security",
    website: "https://www.google.com/recaptcha/",
    color: "#4a90e2",
    scriptSrc: [{ pattern: /(?:google\.com|recaptcha\.net)\/recaptcha\/(?:api|enterprise)\.js|gstatic\.com\/recaptcha\//i, weight: 100 }],
    dom: { ".g-recaptcha, .grecaptcha-badge": { weight: 80 } },
    js: { grecaptcha: { weight: 70 } }
  },

  // ---------- Monitoring ----------
  {
    name: "Sentry",
    category: "monitoring",
    website: "https://sentry.io",
    color: "#362d59",
    js: {
      "Sentry.SDK_VERSION": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 },
      __SENTRY__: { weight: 90 }
    },
    scriptSrc: [{ pattern: /browser\.sentry-cdn\.com\/([\d.]+)/i, version: "\\1", weight: 100 }],
    meta: { "sentry-trace": { weight: 80 } }
  },
  {
    name: "Datadog",
    category: "monitoring",
    website: "https://www.datadoghq.com",
    color: "#632ca6",
    js: {
      "DD_RUM.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 },
      DD_RUM: { weight: 90 },
      DD_LOGS: { weight: 90 }
    },
    scriptSrc: [{ pattern: /datadoghq-browser-agent\.com/i, weight: 100 }]
  }
];
