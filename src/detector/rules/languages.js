// Backend frameworks and languages. Their strongest fingerprints are
// HttpOnly session cookies, which the service worker reads via chrome.cookies
// (names only — values never leave the browser).
export default [
  // ---------- Web frameworks ----------
  {
    name: "Laravel",
    category: "backend",
    website: "https://laravel.com",
    color: "#ff2d20",
    implies: ["PHP"],
    // Laravel names its session cookie "<app-name>_session"; it is only
    // "laravel_session" when the app is literally called Laravel. That cookie
    // plus XSRF-TOKEN together is the usual fingerprint. (Rails session
    // cookies start with "_", so they don't match.)
    cookies: {
      laravel_session: { weight: 100 },
      "/^[a-z0-9][a-z0-9-]*_session$/": { weight: 40 },
      // Also set by other stacks (e.g. Angular apps), so it only hints
      "XSRF-TOKEN": { weight: 30 }
    }
  },
  {
    name: "Django",
    category: "backend",
    website: "https://www.djangoproject.com",
    color: "#0c4b33",
    implies: ["Python"],
    html: [{ pattern: /name=["']csrfmiddlewaretoken["']/i, weight: 90 }],
    cookies: { django_language: { weight: 80 }, csrftoken: { weight: 40 } }
  },
  {
    name: "Ruby on Rails",
    category: "backend",
    website: "https://rubyonrails.org",
    color: "#d30001",
    implies: ["Ruby"],
    meta: { "csrf-param": { pattern: /^authenticity_token$/, weight: 80 } },
    html: [
      // Sprockets/Propshaft digested asset names
      { pattern: /\/assets\/application-[0-9a-f]{32,64}\.(?:js|css)/i, weight: 50 },
      { pattern: /rails-ujs|data-turbo-track=/i, weight: 40 }
    ],
    headers: { "x-runtime": { pattern: /^\d+\.\d+$/, weight: 30 } },
    // Rails default session cookie: "_<app_name>_session"
    cookies: { "/^_[a-z0-9_]+_session$/": { weight: 40 } }
  },
  {
    name: "Express",
    category: "backend",
    website: "https://expressjs.com",
    color: "#353535",
    implies: ["Node.js"],
    headers: { "x-powered-by": /^Express$/i },
    cookies: { "connect.sid": { weight: 80 } }
  },
  {
    name: "ASP.NET",
    category: "backend",
    website: "https://dotnet.microsoft.com/apps/aspnet",
    color: "#512bd4",
    headers: { "x-powered-by": /ASP\.NET/i, "x-aspnet-version": { pattern: /([\d.]+)/, version: "\\1" } },
    cookies: { "ASP.NET_SessionId": { weight: 90 }, ".AspNetCore.Antiforgery*": { weight: 90 } },
    html: [{ pattern: /<input[^>]+name=["']__VIEWSTATE["']/i, weight: 90 }]
  },

  // ---------- Languages ----------
  {
    name: "PHP",
    category: "language",
    website: "https://www.php.net",
    color: "#777bb4",
    headers: { "x-powered-by": { pattern: /PHP(?:\/([\d.]+))?/i, version: "\\1" } },
    cookies: { PHPSESSID: { weight: 80 } }
  },
  {
    name: "Java",
    category: "language",
    website: "https://www.java.com",
    color: "#e76f00",
    headers: { "x-powered-by": { pattern: /Servlet|JSP/i, weight: 80 } },
    cookies: { JSESSIONID: { weight: 70 } }
  },
  // Only ever implied by a framework that runs on them.
  { name: "Node.js", category: "language", website: "https://nodejs.org", color: "#5fa04e" },
  { name: "Python", category: "language", website: "https://www.python.org", color: "#3776ab" },
  { name: "Ruby", category: "language", website: "https://www.ruby-lang.org", color: "#cc342d" }
];
