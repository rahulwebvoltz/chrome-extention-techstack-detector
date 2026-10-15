// Video players and embeds. Embeds are often lazy-loaded (data-src), so the
// HTML patterns don't require a real src attribute.
export default [
  {
    name: "YouTube",
    category: "video",
    website: "https://www.youtube.com",
    color: "#ff0000",
    html: [
      { pattern: /youtube(?:-nocookie)?\.com\/(?:embed\/|iframe_api)|youtube\.com\/s\/player\//i, weight: 90 },
      // Page-builder video widgets store the URL in settings JSON
      { pattern: /video_type(?:&quot;|")\s*:\s*(?:&quot;|")youtube|youtube_url(?:&quot;|")\s*:/i, weight: 70 }
    ],
    scriptSrc: [{ pattern: /youtube\.com\/(?:iframe_api|s\/player\/)/i, weight: 90 }],
    js: { "YT.Player": { weight: 80 } }
  },
  {
    name: "Vimeo",
    category: "video",
    website: "https://vimeo.com",
    color: "#1ab7ea",
    html: [{ pattern: /player\.vimeo\.com\/video\//i, weight: 90 }],
    scriptSrc: [{ pattern: /player\.vimeo\.com\/api\/player\.js/i, weight: 90 }],
    js: { "Vimeo.Player": { weight: 80 } }
  },
  {
    name: "Wistia",
    category: "video",
    website: "https://wistia.com",
    color: "#54bbff",
    scriptSrc: [{ pattern: /fast\.wistia\.(?:com|net)/i, weight: 100 }],
    js: { Wistia: { weight: 70 } }
  },
  {
    name: "JW Player",
    category: "video",
    website: "https://www.jwplayer.com",
    color: "#ef4b5c",
    scriptSrc: [{ pattern: /(?:cdn\.jwplayer\.com|ssl\.p\.jwpcdn\.com|content\.jwplatform\.com)/i, weight: 100 }],
    js: { "jwplayer.version": { pattern: /^([\d.]+)/, version: "\\1", weight: 90 } }
  },
  {
    name: "Video.js",
    category: "video",
    website: "https://videojs.com",
    color: "#e2264d",
    js: { "videojs.VERSION": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    html: [{ pattern: /class=["'][^"']*\bvideo-js\b/i, weight: 70 }]
  },
  {
    name: "Plyr",
    category: "video",
    website: "https://plyr.io",
    color: "#00b2ff",
    js: { Plyr: { weight: 80 } },
    links: [{ pattern: /\/plyr(?:\.min)?\.css|cdn\.plyr\.io/i, weight: 80 }]
  }
];
