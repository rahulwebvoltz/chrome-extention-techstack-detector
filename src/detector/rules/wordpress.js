// WordPress ecosystem: page builders, themes, plugins. Everything here
// implies WordPress.
//
// Themes are identified by the `wp-theme-<slug>` body class (WP 6.5+) or
// their /wp-content/themes/<slug>/ asset path; plugins by their
// /wp-content/plugins/<slug>/ asset path plus their own markup.

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function theme(name, slug, { color, website, ...extra }) {
  return {
    name,
    category: "wpTheme",
    website,
    color,
    implies: ["WordPress"],
    html: [{ pattern: new RegExp(`(?:\\bwp-theme-|/wp-content/themes/)${escape(slug)}\\b`, "i"), weight: 90 }],
    ...extra
  };
}

function plugin(name, slugs, { category = "wpPlugin", color, website, html = [], ...extra }) {
  const path = new RegExp(`/wp-content/plugins/(?:${slugs.map(escape).join("|")})/`, "i");
  return {
    name,
    category,
    website,
    color,
    implies: ["WordPress"],
    html: [{ pattern: path, weight: 80 }, ...html],
    scriptSrc: [{ pattern: path, weight: 80 }],
    links: [{ pattern: path, weight: 80 }],
    ...extra
  };
}

export default [
  // ---------- Page builders ----------
  {
    name: "Elementor",
    category: "pageBuilder",
    website: "https://elementor.com",
    color: "#92003b",
    implies: ["WordPress"],
    meta: { generator: { pattern: /^Elementor ([\d.]+)/i, version: "\\1" } },
    html: [
      { pattern: /class=["'][^"']*\belementor-(?:kit|page|element|section|widget)-?/i, weight: 80 },
      { pattern: /\/wp-content\/plugins\/elementor\//i, weight: 80 }
    ],
    js: { elementorFrontendConfig: { weight: 90 } }
  },
  {
    name: "Elementor Pro",
    category: "pageBuilder",
    website: "https://elementor.com/pro/",
    color: "#92003b",
    implies: ["Elementor"],
    html: [{ pattern: /\/wp-content\/plugins\/elementor-pro\//i, weight: 90 }],
    js: { ElementorProFrontendConfig: { weight: 90 } }
  },
  {
    name: "Divi",
    category: "pageBuilder",
    website: "https://www.elegantthemes.com/gallery/divi/",
    color: "#8c3fd6",
    implies: ["WordPress"],
    meta: { generator: { pattern: /^Divi v\.?([\d.]+)/i, version: "\\1" } },
    html: [
      { pattern: /class=["'][^"']*\bet_pb_(?:section|row|module)\b/i, weight: 80 },
      { pattern: /\/wp-content\/themes\/Divi\//i, weight: 90 }
    ],
    js: { DIVI: { weight: 70 } }
  },
  {
    name: "WPBakery",
    category: "pageBuilder",
    website: "https://wpbakery.com",
    color: "#0473aa",
    implies: ["WordPress"],
    meta: { generator: /WPBakery/i },
    html: [
      { pattern: /class=["'][^"']*\bvc_row\b/i, weight: 70 },
      { pattern: /\/wp-content\/plugins\/js_composer\//i, weight: 90 }
    ]
  },
  {
    name: "Beaver Builder",
    category: "pageBuilder",
    website: "https://www.wpbeaverbuilder.com",
    color: "#6bc373",
    implies: ["WordPress"],
    html: [{ pattern: /class=["'][^"']*\bfl-builder\b|\/wp-content\/plugins\/bb-plugin\//i, weight: 90 }]
  },
  {
    name: "Bricks",
    category: "pageBuilder",
    website: "https://bricksbuilder.io",
    color: "#ffd53e",
    implies: ["WordPress"],
    html: [{ pattern: /class=["'][^"']*\bbrxe-[a-z0-9]+\b|\/wp-content\/themes\/bricks\//i, weight: 90 }]
  },
  {
    name: "Oxygen",
    category: "pageBuilder",
    website: "https://oxygenbuilder.com",
    color: "#1f1f1f",
    implies: ["WordPress"],
    html: [{ pattern: /\/wp-content\/plugins\/oxygen\//i, weight: 90 }, { pattern: /class=["'][^"']*\bct-section\b/i, weight: 40 }]
  },
  {
    name: "Breakdance",
    category: "pageBuilder",
    website: "https://breakdance.com",
    color: "#ffc514",
    implies: ["WordPress"],
    html: [{ pattern: /\/wp-content\/plugins\/breakdance\/|class=["'][^"']*\bbde-section\b/i, weight: 90 }]
  },

  // ---------- Themes ----------
  theme("Hello Elementor", "hello-elementor", { color: "#92003b", website: "https://elementor.com/products/hello-theme/" }),
  theme("Astra", "astra", { color: "#5c2ede", website: "https://wpastra.com" }),
  theme("GeneratePress", "generatepress", { color: "#1e72bd", website: "https://generatepress.com" }),
  theme("OceanWP", "oceanwp", { color: "#13aff0", website: "https://oceanwp.org" }),
  theme("Kadence", "kadence", { color: "#0073e6", website: "https://www.kadencewp.com" }),
  theme("Avada", "Avada", { color: "#65bc7b", website: "https://avada.com" }),
  theme("Neve", "neve", { color: "#0366d6", website: "https://themeisle.com/themes/neve/" }),
  theme("Blocksy", "blocksy", { color: "#1559ed", website: "https://creativethemes.com/blocksy/" }),
  theme("Flatsome", "flatsome", { color: "#446084", website: "https://flatsome.uxthemes.com" }),
  theme("Enfold", "enfold", { color: "#2a87c8", website: "https://kriesi.at/themes/enfold/" }),
  theme("The7", "dt-the7", { color: "#e74c3c", website: "https://the7.io" }),
  theme("Storefront", "storefront", { color: "#7f54b3", website: "https://woocommerce.com/storefront/" }),

  // ---------- Plugins ----------
  plugin("Contact Form 7", ["contact-form-7"], {
    color: "#33a0d4",
    website: "https://contactform7.com",
    html: [{ pattern: /class=["'][^"']*\bwpcf7(?:-form)?\b/i, weight: 90 }]
  }),
  plugin("WPForms", ["wpforms", "wpforms-lite"], {
    color: "#e27730",
    website: "https://wpforms.com",
    html: [{ pattern: /class=["'][^"']*\bwpforms-container\b/i, weight: 90 }]
  }),
  plugin("Gravity Forms", ["gravityforms"], {
    color: "#f15a2b",
    website: "https://www.gravityforms.com",
    html: [{ pattern: /class=["'][^"']*\bgform_wrapper\b/i, weight: 90 }]
  }),
  plugin("Jetpack", ["jetpack"], {
    color: "#069e08",
    website: "https://jetpack.com",
    scriptSrc: [{ pattern: /\/wp-content\/plugins\/jetpack\/|stats\.wp\.com\/e-/i, weight: 80 }]
  }),
  plugin("Elementor Header & Footer Builder", ["header-footer-elementor"], {
    color: "#92003b",
    website: "https://wordpress.org/plugins/header-footer-elementor/",
    implies: ["Elementor"],
    html: [{ pattern: /class=["'][^"']*\behf-(?:header|footer)\b/i, weight: 90 }]
  }),
  plugin("ElementsKit", ["elementskit-lite", "elementskit"], {
    color: "#3e2bce",
    website: "https://wpmet.com/plugin/elementskit/",
    implies: ["Elementor"],
    html: [{ pattern: /class=["'][^"']*\b(?:ekit-wid-con|elementor-widget-ekit-[a-z-]+)\b/i, weight: 90 }]
  }),
  plugin("Jeg Elementor Kit", ["jeg-elementor-kit"], {
    color: "#4c3ce4",
    website: "https://jegtheme.com/jeg-elementor-kit/",
    implies: ["Elementor"],
    html: [{ pattern: /class=["'][^"']*\bjkit-(?:color-scheme|[a-z]+-[a-z]+)\b/i, weight: 80 }]
  }),
  plugin("Essential Addons for Elementor", ["essential-addons-for-elementor-lite", "essential-addons-elementor"], {
    color: "#6c50f6",
    website: "https://essential-addons.com",
    implies: ["Elementor"],
    html: [{ pattern: /class=["'][^"']*\beael-[a-z-]+\b/i, weight: 80 }]
  }),
  plugin("Slider Revolution", ["revslider"], {
    color: "#3c00ff",
    website: "https://www.sliderrevolution.com",
    meta: { generator: { pattern: /Powered by Slider Revolution ([\d.]+)/i, version: "\\1" } },
    html: [{ pattern: /<rs-module\b/i, weight: 80 }]
  }),
  plugin("WPML", ["sitepress-multilingual-cms"], {
    color: "#3b3b3b",
    website: "https://wpml.org",
    meta: { generator: { pattern: /WPML ver:([\d.]+)/i, version: "\\1" } }
  }),
  plugin("Polylang", ["polylang", "polylang-pro"], { color: "#1e73be", website: "https://polylang.pro" }),
  plugin("MonsterInsights", ["google-analytics-for-wordpress", "google-analytics-premium"], {
    color: "#6f4bb2",
    website: "https://www.monsterinsights.com",
    implies: ["Google Analytics"],
    html: [{ pattern: /This site uses the Google Analytics by MonsterInsights plugin v([\d.]+)/i, version: "\\1", weight: 100 }]
  }),
  plugin("Site Kit by Google", ["google-site-kit"], {
    color: "#4285f4",
    website: "https://sitekit.withgoogle.com",
    meta: { generator: { pattern: /^Site Kit by Google ([\d.]+)/i, version: "\\1" } }
  }),
  plugin("Akismet", ["akismet"], {
    color: "#357b49",
    website: "https://akismet.com",
    html: [{ pattern: /name=["']ak_(?:js|hp_textarea)["']/i, weight: 80 }]
  }),

  // ---------- SEO plugins ----------
  plugin("Yoast SEO", ["wordpress-seo", "wordpress-seo-premium"], {
    category: "seo",
    color: "#a4286a",
    website: "https://yoast.com/wordpress/plugins/seo/",
    html: [
      { pattern: /optimized with the Yoast SEO(?: Premium)? plugin v([\d.]+)/i, version: "\\1", weight: 100 },
      { pattern: /class=["']yoast-schema-graph/i, weight: 90 }
    ]
  }),
  plugin("Rank Math SEO", ["seo-by-rank-math", "seo-by-rank-math-pro"], {
    category: "seo",
    color: "#4a2ed5",
    website: "https://rankmath.com",
    html: [
      { pattern: /class=["']rank-math-schema(?:-pro)?["']/i, weight: 90 },
      { pattern: /Search Engine Optimization by Rank Math/i, weight: 100 }
    ]
  }),
  plugin("All in One SEO", ["all-in-one-seo-pack", "all-in-one-seo-pack-pro"], {
    category: "seo",
    color: "#005ae0",
    website: "https://aioseo.com",
    html: [
      { pattern: /All in One SEO(?: Pro)? \(AIOSEO\) ([\d.]+)/i, version: "\\1", weight: 100 },
      { pattern: /class=["']aioseo-schema["']/i, weight: 90 }
    ]
  }),
  plugin("The SEO Framework", ["autodescription"], {
    category: "seo",
    color: "#0ebfe9",
    website: "https://theseoframework.com",
    html: [{ pattern: /The SEO Framework by Sybre Waaijer/i, weight: 100 }]
  }),

  // ---------- Caching / performance plugins ----------
  plugin("LiteSpeed Cache", ["litespeed-cache"], {
    category: "caching",
    color: "#0d6efd",
    website: "https://www.litespeedtech.com/products/cache-plugins/wordpress-acceleration",
    html: [{ pattern: /\/wp-content\/litespeed\/|type=["']litespeed\/javascript["']/i, weight: 90 }]
  }),
  plugin("WP Rocket", ["wp-rocket"], {
    category: "caching",
    color: "#f56640",
    website: "https://wp-rocket.me",
    meta: { generator: { pattern: /^WP Rocket ([\d.]+)/i, version: "\\1" } },
    html: [{ pattern: /This website is like a Rocket|data-rocket-src=|\/wp-content\/cache\/(?:min|wp-rocket)\//i, weight: 90 }]
  }),
  plugin("W3 Total Cache", ["w3-total-cache"], {
    category: "caching",
    color: "#355d8c",
    website: "https://www.boldgrid.com/w3-total-cache/",
    html: [{ pattern: /Performance optimized by W3 Total Cache/i, weight: 100 }],
    headers: { "x-powered-by": { pattern: /W3 Total Cache\/([\d.]+)/i, version: "\\1" } }
  }),
  plugin("WP Super Cache", ["wp-super-cache"], {
    category: "caching",
    color: "#21759b",
    website: "https://wordpress.org/plugins/wp-super-cache/",
    html: [{ pattern: /WP-Super-Cache|generated by WP-Super-Cache/i, weight: 90 }]
  }),
  plugin("WP Fastest Cache", ["wp-fastest-cache"], {
    category: "caching",
    color: "#ff7f00",
    website: "https://www.wpfastestcache.com",
    html: [{ pattern: /WP Fastest Cache file was created/i, weight: 100 }]
  }),
  plugin("Autoptimize", ["autoptimize"], {
    category: "caching",
    color: "#c72027",
    website: "https://autoptimize.com",
    html: [{ pattern: /\/wp-content\/cache\/autoptimize\//i, weight: 100 }]
  }),
  plugin("Complianz", ["complianz-gdpr", "complianz-gdpr-premium"], {
    category: "consent",
    color: "#29b6f6",
    website: "https://complianz.io",
    html: [{ pattern: /class=["'][^"']*\bcmplz-(?:cookiebanner|consent|document)\b/i, weight: 90 }]
  })
];
