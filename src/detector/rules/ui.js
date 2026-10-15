export default [
  {
    name: "Tailwind CSS",
    category: "ui",
    website: "https://tailwindcss.com",
    color: "#38bdf8",
    // Tailwind's preflight defines --tw-* variables on every element.
    cssVars: ["--tw-ring-offset-width", "--tw-border-spacing-x", "--tw-shadow"],
    html: [
      { pattern: /tailwindcss v?([\d.]+)/i, version: "\\1", weight: 100 },
      // A cluster of utility classes in a single class attribute. Weak on
      // purpose: docs/blog pages can show Tailwind markup as examples.
      { pattern: /class=["'][^"']*\b(?:sm|md|lg|xl):(?:flex|grid|hidden|block|px-\d|py-\d|text-\w+)[^"']*\b(?:px|py|mx|my|gap|rounded)-/i, weight: 25 }
    ],
    links: [/tailwind(?:css)?(?:\.min)?\.css/i],
    scriptSrc: [/cdn\.tailwindcss\.com/i]
  },
  {
    name: "Bootstrap",
    category: "ui",
    website: "https://getbootstrap.com",
    color: "#7952b3",
    js: {
      "bootstrap.Tooltip.VERSION": { pattern: /^([\d.]+)/, version: "\\1", weight: 90 },
      "jQuery.fn.tooltip.Constructor.VERSION": { pattern: /^([\d.]+)/, version: "\\1", weight: 90 }
    },
    // Filename must be exactly bootstrap(.min).css/js — not bootstrap-icons etc.
    links: [
      /\/bootstrap(?:\.min)?\.css(?:[?#]|$)/i,
      { pattern: /(?:bootstrap@|twitter-bootstrap\/)([\d.]+)/i, version: "\\1", weight: 20 }
    ],
    scriptSrc: [
      /\/bootstrap(?:\.bundle)?(?:\.min)?\.js(?:[?#]|$)/i,
      { pattern: /(?:bootstrap@|twitter-bootstrap\/)([\d.]+)/i, version: "\\1", weight: 20 }
    ],
    html: [{ pattern: /class=["'][^"']*\b(?:col-(?:xs|sm|md|lg)-\d+|navbar-expand-(?:sm|md|lg))\b/i, weight: 30 }]
  },
  {
    name: "Bulma",
    category: "ui",
    website: "https://bulma.io",
    color: "#00d1b2",
    links: [
      { pattern: /\/bulma(?:\.min)?\.css(?:[?#]|$)/i, weight: 90 },
      { pattern: /bulma@([\d.]+)/i, version: "\\1", weight: 10 }
    ]
  },
  {
    name: "MUI",
    category: "ui",
    website: "https://mui.com",
    color: "#007fff",
    implies: ["React"],
    html: [{ pattern: /class=["'][^"']*\bMui[A-Z][A-Za-z]+-root\b/, weight: 90 }]
  },
  {
    name: "Font Awesome",
    category: "fonts",
    website: "https://fontawesome.com",
    color: "#538dd7",
    links: [{ pattern: /font-?awesome(?:@|\/)?([\d.]+)?|use\.fontawesome\.com/i, version: "\\1", weight: 90 }],
    scriptSrc: [{ pattern: /kit\.fontawesome\.com|use\.fontawesome\.com/i, weight: 90 }],
    // Survives CSS merging by optimisers, unlike the stylesheet URL
    css: [{ pattern: /font-family:\s*"?Font Awesome (?:\d+ )?(?:Free|Pro|Brands)/i, weight: 90 }]
  },
  {
    name: "Lucide",
    category: "fonts",
    website: "https://lucide.dev",
    color: "#f56565",
    // Lucide renders inline SVGs tagged class="lucide lucide-<icon-name>"
    html: [{ pattern: /<svg[^>]+class=["'][^"']*\blucide lucide-[a-z0-9-]+/i, weight: 100 }]
  },
  {
    name: "Google Fonts",
    category: "fonts",
    website: "https://fonts.google.com",
    color: "#4285f4",
    links: [{ pattern: /fonts\.googleapis\.com/i, weight: 100 }],
    html: [/fonts\.gstatic\.com/i],
    css: [{ pattern: /fonts\.gstatic\.com\/s\//i, weight: 90 }]
  },
  {
    name: "Foundation",
    category: "ui",
    website: "https://get.foundation",
    color: "#14679e",
    js: { "Foundation.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    links: [{ pattern: /\/foundation(?:\.min)?\.css(?:[?#]|$)/i, weight: 70 }]
  },
  {
    name: "Semantic UI",
    category: "ui",
    website: "https://semantic-ui.com",
    color: "#35bdb2",
    links: [{ pattern: /\/semantic(?:-ui)?(?:\.min)?\.css(?:[?#]|$)|fomantic-ui/i, weight: 90 }],
    html: [{ pattern: /class=["']ui (?:[a-z]+ )*(?:button|menu|segment|grid|container)\b/i, weight: 40 }]
  },
  {
    name: "Ant Design",
    category: "ui",
    website: "https://ant.design",
    color: "#1677ff",
    implies: ["React"],
    html: [{ pattern: /class=["'][^"']*\bant-(?:btn|layout|menu|row|col|input|select|card|dropdown|space)\b/, weight: 80 }]
  },
  {
    name: "Chakra UI",
    category: "ui",
    website: "https://chakra-ui.com",
    color: "#319795",
    implies: ["React"],
    cssVars: ["--chakra-colors-gray-100", "--chakra-ring-inset"],
    html: [{ pattern: /class=["'][^"']*\bchakra-[a-z]+(?:__[a-z]+)?\b/, weight: 70 }]
  },
  {
    name: "Mantine",
    category: "ui",
    website: "https://mantine.dev",
    color: "#339af0",
    implies: ["React"],
    cssVars: ["--mantine-scale", "--mantine-color-body"],
    html: [{ pattern: /class=["'][^"']*\bmantine-[A-Z][A-Za-z]+-root\b/, weight: 80 }]
  },
  {
    name: "Radix UI",
    category: "ui",
    website: "https://www.radix-ui.com",
    color: "#161618",
    implies: ["React"],
    html: [{ pattern: /\sdata-radix-[a-z-]+/i, weight: 80 }]
  },
  {
    name: "DaisyUI",
    category: "ui",
    website: "https://daisyui.com",
    color: "#1ad1a5",
    implies: ["Tailwind CSS"],
    // Theme variables: v4 (--rounded-box) and v5 (--radius-box / --color-base-100)
    cssVars: ["--rounded-box", "--radius-box", "--color-base-100"]
  },
  {
    name: "styled-components",
    category: "ui",
    website: "https://styled-components.com",
    color: "#db7093",
    html: [
      { pattern: /<style[^>]+data-styled(?:-version=["']([\d.]+))?/i, version: "\\1", weight: 90 },
      { pattern: /class=["'][^"']*\bsc-[a-zA-Z]{5,}\b/, weight: 30 }
    ]
  },
  {
    name: "Emotion",
    category: "ui",
    website: "https://emotion.sh",
    color: "#d26ac2",
    html: [{ pattern: /<style[^>]+data-emotion=/i, weight: 90 }]
  },
  {
    name: "Less",
    category: "ui",
    website: "https://lesscss.org",
    color: "#1d365d",
    // Only detectable when compiled in the browser (less.js)
    html: [{ pattern: /<link[^>]+rel=["']stylesheet\/less["']/i, weight: 90 }],
    scriptSrc: [{ pattern: /\/less(?:\.min)?\.js(?:[?#]|$)|\/less@([\d.]+)/i, version: "\\1", weight: 70 }]
  }
];
