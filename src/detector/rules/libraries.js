export default [
  {
    name: "jQuery",
    category: "library",
    website: "https://jquery.com",
    color: "#0769ad",
    js: { "jQuery.fn.jquery": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    scriptSrc: [
      // WordPress core: /wp-includes/js/jquery/jquery.min.js?ver=3.7.1
      { pattern: /\/wp-includes\/js\/jquery\/jquery(?:\.min)?\.js\?ver=([\d.]+)/i, version: "\\1", weight: 70 },
      { pattern: /\/jquery(?:-|@)?([\d.]+)?(?:\.slim)?(?:\.min)?\.js(?:[?#]|$)/i, version: "\\1", weight: 60 }]
  },
  {
    name: "Lodash",
    category: "library",
    website: "https://lodash.com",
    color: "#3492ff",
    excludes: ["Underscore.js"],
    // Underscore also has _.VERSION, so it only supplies the version;
    // cloneDeepWith exists in Lodash but not in Underscore.
    js: {
      "_.cloneDeepWith": { weight: 80 },
      "_.VERSION": { pattern: /^([\d.]+)/, version: "\\1", versionOnly: true }
    },
    scriptSrc: [/\/lodash(?:\.min)?\.js/i]
  },
  {
    name: "GSAP",
    category: "library",
    website: "https://gsap.com",
    color: "#0ae448",
    js: { "gsap.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    scriptSrc: [/\/gsap(?:\.min)?\.js|\/gsap@/i]
  },
  {
    name: "core-js",
    category: "library",
    website: "https://github.com/zloirock/core-js",
    color: "#f5b400",
    js: {
      "__core-js_shared__.versions": { weight: 90 },
      "__core-js_shared__.versions.0.version": { pattern: /^([\d.]+)/, version: "\\1", versionOnly: true }
    }
  },

  // ---------- jQuery family (WordPress ships these with ?ver=) ----------
  {
    name: "jQuery Migrate",
    category: "library",
    website: "https://github.com/jquery/jquery-migrate",
    color: "#0769ad",
    implies: ["jQuery"],
    js: { "jQuery.migrateVersion": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    scriptSrc: [{ pattern: /\/jquery-migrate(?:\.min)?\.js(?:\?ver=([\d.]+))?/i, version: "\\1", weight: 80 }]
  },
  {
    name: "jQuery UI",
    category: "library",
    website: "https://jqueryui.com",
    color: "#0769ad",
    implies: ["jQuery"],
    js: { "jQuery.ui.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    scriptSrc: [{ pattern: /\/jquery-ui(?:[.-][\d.]+)?(?:\.min)?\.js|\/wp-includes\/js\/jquery\/ui\//i, weight: 70 }]
  },
  {
    name: "Underscore.js",
    category: "library",
    website: "https://underscorejs.org",
    color: "#0371b5",
    js: { "_.VERSION": { pattern: /^([\d.]+)/, version: "\\1", weight: 80 } },
    scriptSrc: [{ pattern: /\/underscore(?:-min|\.min)?\.js(?:\?ver=([\d.]+))?/i, version: "\\1", weight: 70 }]
  },

  // ---------- Sliders / carousels ----------
  {
    name: "Swiper",
    category: "library",
    website: "https://swiperjs.com",
    color: "#0080ff",
    js: { "Swiper.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 }, Swiper: { weight: 80 } },
    html: [{ pattern: /class=["'](?:[^"']*\s)?swiper(?:-wrapper|-slide|-container)?(?:\s[^"']*)?["']/i, weight: 70 }],
    scriptSrc: [{ pattern: /\/swiper(?:-bundle)?(?:\.min)?\.js|swiper@([\d.]+)/i, version: "\\1", weight: 80 }]
  },
  {
    name: "Slick",
    category: "library",
    website: "https://kenwheeler.github.io/slick/",
    color: "#2b2b2b",
    implies: ["jQuery"],
    js: { "jQuery.fn.slick": { weight: 90 } },
    html: [{ pattern: /class=["'][^"']*\bslick-(?:slider|track|list)\b/i, weight: 70 }]
  },
  {
    name: "Owl Carousel",
    category: "library",
    website: "https://owlcarousel2.github.io/OwlCarousel2/",
    color: "#e05e00",
    implies: ["jQuery"],
    js: { "jQuery.fn.owlCarousel": { weight: 90 } },
    html: [{ pattern: /class=["'][^"']*\bowl-carousel\b/i, weight: 70 }]
  },
  {
    name: "Splide",
    category: "library",
    website: "https://splidejs.com",
    color: "#ff8800",
    js: { Splide: { weight: 80 } },
    html: [{ pattern: /class=["'][^"']*\bsplide__(?:track|list|slide)\b/i, weight: 80 }]
  },
  {
    name: "Flickity",
    category: "library",
    website: "https://flickity.metafizzy.co",
    color: "#ed2e64",
    js: { Flickity: { weight: 80 } },
    html: [{ pattern: /class=["'][^"']*\bflickity-(?:viewport|slider|enabled)\b/i, weight: 80 }]
  },

  // ---------- Lightboxes / UI helpers ----------
  {
    name: "Fancybox",
    category: "library",
    website: "https://fancyapps.com",
    color: "#1d1d1d",
    js: {
      "Fancybox.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 },
      "jQuery.fancybox.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 }
    }
  },
  {
    name: "Magnific Popup",
    category: "library",
    website: "https://dimsemenov.com/plugins/magnific-popup/",
    color: "#3b3b3b",
    implies: ["jQuery"],
    js: { "jQuery.magnificPopup": { weight: 90 } }
  },
  {
    name: "GLightbox",
    category: "library",
    website: "https://biati-digital.github.io/glightbox/",
    color: "#3a3a3a",
    js: { GLightbox: { weight: 80 } },
    links: [{ pattern: /glightbox(?:\.min)?\.css/i, weight: 80 }]
  },
  {
    name: "Select2",
    category: "library",
    website: "https://select2.org",
    color: "#3875d7",
    implies: ["jQuery"],
    js: { "jQuery.fn.select2": { weight: 90 } }
  },
  {
    name: "AOS",
    category: "library",
    website: "https://michalsnik.github.io/aos/",
    color: "#2c3e50",
    js: { AOS: { weight: 70 } },
    html: [{ pattern: /\sdata-aos=["'][a-z-]+["']/i, weight: 50 }],
    links: [{ pattern: /\/aos(?:@[\d.]+)?\/dist\/aos\.css|\/aos(?:\.min)?\.css/i, weight: 80 }]
  },
  {
    name: "Isotope",
    category: "library",
    website: "https://isotope.metafizzy.co",
    color: "#db7093",
    js: { Isotope: { weight: 80 }, "jQuery.fn.isotope": { weight: 80 } }
  },
  {
    name: "Lazysizes",
    category: "library",
    website: "https://github.com/aFarkas/lazysizes",
    color: "#3d4e5e",
    js: { lazySizes: { weight: 90 } },
    html: [{ pattern: /class=["'][^"']*\blazyload\b[^"']*["'][^>]*\sdata-src=/i, weight: 30 }]
  },
  {
    name: "Lottie",
    category: "library",
    website: "https://airbnb.io/lottie/",
    color: "#00ddb3",
    js: {
      "lottie.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 90 },
      lottie: { weight: 80 },
      bodymovin: { weight: 80 }
    },
    dom: { "lottie-player, dotlottie-player, dotlottie-wc": { weight: 90 } }
  },

  // ---------- General purpose ----------
  {
    name: "PDF.js",
    category: "library",
    website: "https://mozilla.github.io/pdf.js/",
    color: "#ff0000",
    // v1.x exposed window.PDFJS; v2+ exposes window.pdfjsLib
    js: {
      "pdfjsLib.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 },
      "PDFJS.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 }
    },
    scriptSrc: [{ pattern: /\/pdf(?:\.min)?\.m?js(?:[?#]|$)|\/pdfjs-dist@([\d.]+)/i, version: "\\1", weight: 70 }]
  },
  {
    name: "Moment.js",
    category: "library",
    website: "https://momentjs.com",
    color: "#4b4b4b",
    js: { "moment.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } }
  },
  {
    name: "Chart.js",
    category: "library",
    website: "https://www.chartjs.org",
    color: "#ff6384",
    js: { "Chart.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    scriptSrc: [{ pattern: /\/chart(?:\.umd)?(?:\.min)?\.js(?:[?#]|$)|chart\.js@([\d.]+)/i, version: "\\1", weight: 60 }]
  },
  {
    name: "Three.js",
    category: "library",
    website: "https://threejs.org",
    color: "#049ef4",
    // REVISION is e.g. "160" → release 0.160
    js: { "THREE.REVISION": { pattern: /^(\d+)/, version: "0.\\1", weight: 100 } }
  },
  {
    name: "D3",
    category: "library",
    website: "https://d3js.org",
    color: "#f9a03c",
    js: { "d3.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } }
  },
  {
    name: "Modernizr",
    category: "library",
    website: "https://modernizr.com",
    color: "#d81a5d",
    js: { "Modernizr._version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } }
  },
  {
    name: "htmx",
    category: "library",
    website: "https://htmx.org",
    color: "#3366cc",
    js: { "htmx.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    html: [{ pattern: /\shx-(?:get|post|put|delete|patch)=["']/i, weight: 60 }]
  },
  {
    name: "Axios",
    category: "library",
    website: "https://axios-http.com",
    color: "#5a29e4",
    js: { "axios.VERSION": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } }
  },
  {
    name: "clipboard.js",
    category: "library",
    website: "https://clipboardjs.com",
    color: "#3b3b3b",
    js: { ClipboardJS: { weight: 90 } }
  },
  {
    name: "Hammer.js",
    category: "library",
    website: "https://hammerjs.github.io",
    color: "#ffd700",
    js: { "Hammer.VERSION": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } }
  }
];
