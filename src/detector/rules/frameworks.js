// Note on React/Vue: their DOM markers are JS properties on elements
// ("expandos"), which are only visible from the page's main world.
export default [
  {
    name: "React",
    category: "framework",
    website: "https://react.dev",
    color: "#149eca",
    js: { "React.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 90 } },
    expando: ["__reactFiber$", "__reactContainer$", "__reactInternalInstance$", "_reactRootContainer"],
    html: [{ pattern: /\sdata-react(?:root|id)\b/i, weight: 70 }],
    // Anchored filename so "react-icons.js" or "preact.js" don't count.
    scriptSrc: [{ pattern: /\/react(?:-dom)?(?:\.production|\.development)?(?:\.min)?\.js(?:[?#]|$)|\/react(?:-dom)?@([\d.]+)/i, version: "\\1", weight: 50 }]
  },
  {
    name: "Next.js",
    category: "framework",
    website: "https://nextjs.org",
    color: "#000000",
    implies: ["React"],
    headers: { "x-powered-by": { pattern: /Next\.js ?([\d.]+)?/i, version: "\\1" } },
    js: {
      "next.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 90 },
      __NEXT_DATA__: { weight: 90 }
    },
    html: [
      { pattern: /\/_next\/static\//i, weight: 60 },
      { pattern: /<div id="__next"/i, weight: 40 }
    ]
  },
  {
    name: "Remix",
    category: "framework",
    website: "https://remix.run",
    color: "#121212",
    implies: ["React"],
    js: { __remixContext: { weight: 100 } }
  },
  {
    name: "Gatsby",
    category: "framework",
    website: "https://www.gatsbyjs.com",
    color: "#663399",
    implies: ["React"],
    meta: { generator: { pattern: /^Gatsby ?([\d.]+)?/i, version: "\\1" } },
    dom: { "#___gatsby": { weight: 90 } }
  },
  {
    name: "Vue.js",
    category: "framework",
    website: "https://vuejs.org",
    color: "#41b883",
    js: { "Vue.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 90 } },
    expando: ["__vue_app__", "__vue__"],
    html: [{ pattern: /\sdata-v-[0-9a-f]{8}\b/, weight: 60 }],
    scriptSrc: [{ pattern: /\/vue(?:\.runtime)?(?:\.global)?(?:\.prod)?(?:\.min)?\.js(?:[?#]|$)|\/vue@([\d.]+)/i, version: "\\1", weight: 50 }]
  },
  {
    name: "Nuxt",
    category: "framework",
    website: "https://nuxt.com",
    color: "#00dc82",
    implies: ["Vue.js"],
    js: { __NUXT__: { weight: 90 }, $nuxt: { weight: 90 } },
    html: [
      { pattern: /\/_nuxt\//i, weight: 60 },
      { pattern: /<div id="__nuxt"/i, weight: 60 }
    ]
  },
  {
    name: "Angular",
    category: "framework",
    website: "https://angular.dev",
    color: "#dd0031",
    dom: { "[ng-version]": { attribute: "ng-version", pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    html: [{ pattern: /\s_ng(?:host|content)-[a-z0-9-]+/i, weight: 60 }]
  },
  {
    name: "AngularJS",
    category: "framework",
    website: "https://angularjs.org",
    color: "#b52e31",
    js: { "angular.version.full": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    dom: { "[ng-app], [data-ng-app]": { weight: 70 } }
  },
  {
    name: "Svelte",
    category: "framework",
    website: "https://svelte.dev",
    color: "#ff3e00",
    js: { __svelte: { weight: 80 } },
    html: [{ pattern: /class=["'][^"']*\bsvelte-[a-z0-9]{5,}\b/i, weight: 70 }]
  },
  {
    name: "Astro",
    category: "framework",
    website: "https://astro.build",
    color: "#bc52ee",
    meta: { generator: { pattern: /^Astro v?([\d.]+)?/i, version: "\\1" } },
    dom: { "astro-island": { weight: 90 } },
    html: [
      { pattern: /\/_astro\//i, weight: 60 },
      // Scoped styles: present even on fully static Astro sites (no islands)
      { pattern: /\sdata-astro-cid-[a-z0-9]+/i, weight: 90 }
    ]
  },
  {
    name: "SvelteKit",
    category: "framework",
    website: "https://svelte.dev/docs/kit",
    color: "#ff3e00",
    implies: ["Svelte"],
    // SvelteKit keeps its runtime in a global named __sveltekit_<hash>
    jsPrefix: ["__sveltekit_"],
    html: [
      { pattern: /\sdata-sveltekit-[a-z-]+=/i, weight: 90 },
      { pattern: /\/_app\/immutable\//i, weight: 70 }
    ]
  },
  {
    name: "Ember.js",
    category: "framework",
    website: "https://emberjs.com",
    color: "#e04e39",
    js: { "Ember.VERSION": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    dom: { ".ember-application": { weight: 80 } }
  },
  {
    name: "Preact",
    category: "framework",
    website: "https://preactjs.com",
    color: "#673ab8",
    js: { preact: { weight: 70 } },
    scriptSrc: [{ pattern: /\/preact(?:\.umd|\.min|\.module)*\.js(?:[?#]|$)|\/preact@([\d.]+)/i, version: "\\1", weight: 60 }],
    expando: ["__preactattr_"]
  },
  {
    name: "SolidJS",
    category: "framework",
    website: "https://www.solidjs.com",
    color: "#2c4f7c",
    js: { _$HY: { weight: 90 } },
    html: [{ pattern: /\sdata-hk=["'][\d-]+["']/i, weight: 60 }]
  },
  {
    name: "Qwik",
    category: "framework",
    website: "https://qwik.dev",
    color: "#ac7ef4",
    html: [
      { pattern: /\sq:container=["']/i, weight: 100 },
      { pattern: /\sq:version=["']([\d.]+)/i, version: "\\1", weight: 30 }
    ]
  },
  {
    name: "Meteor",
    category: "framework",
    website: "https://www.meteor.com",
    color: "#de4f4f",
    implies: ["Node.js"],
    js: {
      "Meteor.release": { pattern: /METEOR@([\d.]+)/, version: "\\1", weight: 100 },
      __meteor_runtime_config__: { weight: 90 }
    }
  },
  {
    name: "Lit",
    category: "framework",
    website: "https://lit.dev",
    color: "#324fff",
    // Lit registers its versions in global arrays
    js: {
      "litElementVersions.0": { pattern: /^([\d.]+)/, version: "\\1", weight: 90 },
      "litHtmlVersions.0": { pattern: /^([\d.]+)/, version: "\\1", weight: 70 }
    }
  },
  {
    name: "Alpine.js",
    category: "library",
    website: "https://alpinejs.dev",
    color: "#77c1d2",
    js: { "Alpine.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    // x-data alone is a hint; other libraries (e.g. petite-vue) use it too
    html: [{ pattern: /\sx-data(?:=["']|\s|>)/i, weight: 40 }],
    scriptSrc: [{ pattern: /alpinejs(?:@([\d.]+))?/i, version: "\\1", weight: 80 }]
  },
  {
    name: "Backbone.js",
    category: "library",
    website: "https://backbonejs.org",
    color: "#0071b5",
    js: { "Backbone.VERSION": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    scriptSrc: [{ pattern: /\/backbone(?:-min|\.min)?\.js(?:[?#]|$)/i, weight: 60 }]
  }
];
