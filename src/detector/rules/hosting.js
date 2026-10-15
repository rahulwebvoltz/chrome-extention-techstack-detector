export default [
  // ---------- Cloud providers ----------
  {
    name: "Amazon Web Services",
    category: "hosting",
    website: "https://aws.amazon.com",
    color: "#ff9900",
    headers: {
      server: /^awselb\//i,
      "x-amzn-requestid": { weight: 80 },
      "x-amzn-trace-id": { weight: 80 },
      "x-amz-request-id": { weight: 80 }
    },
    // Application/Classic Load Balancer stickiness cookies
    cookies: { AWSALB: { weight: 90 }, AWSALBCORS: { weight: 90 }, AWSELB: { weight: 90 } }
  },
  {
    name: "Amazon S3",
    category: "hosting",
    website: "https://aws.amazon.com/s3/",
    color: "#569a31",
    implies: ["Amazon Web Services"],
    headers: { server: /^AmazonS3$/i, "x-amz-bucket-region": true }
  },
  {
    name: "Google Cloud",
    category: "hosting",
    website: "https://cloud.google.com",
    color: "#4285f4",
    headers: {
      server: /^Google Frontend$/i,
      "x-cloud-trace-context": { weight: 80 },
      via: { pattern: /\b1\.1 google\b/i, weight: 60 }
    }
  },
  {
    name: "Microsoft Azure",
    category: "hosting",
    website: "https://azure.microsoft.com",
    color: "#0078d4",
    headers: {
      "x-azure-ref": true,
      server: /Microsoft-Azure-Application-Gateway|Windows-Azure/i,
      "x-ms-request-id": { weight: 50 }
    },
    cookies: { ARRAffinity: { weight: 80 }, ARRAffinitySameSite: { weight: 80 } }
  },
  {
    name: "DigitalOcean",
    category: "hosting",
    website: "https://www.digitalocean.com",
    color: "#0080ff",
    // Spaces object storage / CDN
    html: [{ pattern: /[a-z0-9-]+\.(?:[a-z0-9-]+\.)?(?:cdn\.)?digitaloceanspaces\.com/i, weight: 80 }],
    scriptSrc: [{ pattern: /digitaloceanspaces\.com/i, weight: 80 }]
  },

  // ---------- PaaS ----------
  {
    name: "Vercel",
    category: "hosting",
    website: "https://vercel.com",
    color: "#000000",
    headers: { server: /^Vercel$/i, "x-vercel-id": true, "x-vercel-cache": true }
  },
  {
    name: "Netlify",
    category: "hosting",
    website: "https://www.netlify.com",
    color: "#00ad9f",
    headers: { server: /Netlify/i, "x-nf-request-id": true }
  },
  {
    name: "GitHub Pages",
    category: "hosting",
    website: "https://pages.github.com",
    color: "#24292f",
    headers: { server: /^GitHub\.com$/i, "x-github-request-id": { weight: 60 } }
  },
  {
    name: "Heroku",
    category: "hosting",
    website: "https://www.heroku.com",
    color: "#430098",
    headers: { via: /vegur/i }
  },
  {
    name: "Render",
    category: "hosting",
    website: "https://render.com",
    color: "#46e3b7",
    headers: { "x-render-origin-server": true, "rndr-id": true }
  },
  {
    name: "Railway",
    category: "hosting",
    website: "https://railway.com",
    color: "#853bce",
    headers: { server: /railway/i, "x-railway-request-id": true, "x-railway-edge": true }
  },

  // ---------- Managed / shared hosting ----------
  {
    name: "Hostinger",
    category: "hosting",
    website: "https://www.hostinger.com",
    color: "#673de6",
    headers: { platform: /hostinger/i, panel: /^hpanel$/i }
  },
  {
    name: "Kinsta",
    category: "hosting",
    website: "https://kinsta.com",
    color: "#5333ed",
    headers: { "x-kinsta-cache": true }
  },
  {
    name: "WP Engine",
    category: "hosting",
    website: "https://wpengine.com",
    color: "#0ecad4",
    implies: ["WordPress"],
    headers: { "x-powered-by": /WP Engine/i, "wpe-backend": true }
  },
  {
    name: "Pantheon",
    category: "hosting",
    website: "https://pantheon.io",
    color: "#ffdc28",
    headers: { "x-pantheon-styx-hostname": true, "x-styx-req-id": { weight: 90 } }
  },

  // ---------- Backend as a service ----------
  {
    name: "Firebase",
    category: "baas",
    website: "https://firebase.google.com",
    color: "#ffca28",
    implies: ["Google Cloud"],
    js: { "firebase.SDK_VERSION": { pattern: /^([\d.]+)/, version: "\\1", weight: 100 } },
    scriptSrc: [{ pattern: /gstatic\.com\/firebasejs\/([\d.]+)/i, version: "\\1", weight: 100 }],
    // Firebase Hosting reserved URLs
    html: [{ pattern: /\/__\/firebase\/(?:init\.js|[\d.]+\/)/i, weight: 90 }],
    // Firebase Hosting varies its cache on its own internal header
    headers: { vary: { pattern: /\bx-fh-requested-host\b/i, weight: 90 } }
  },
  {
    name: "Supabase",
    category: "baas",
    website: "https://supabase.com",
    color: "#3ecf8e",
    html: [{ pattern: /\b[a-z0-9]{20}\.supabase\.co\b/i, weight: 90 }],
    scriptSrc: [{ pattern: /@supabase\/supabase-js(?:@([\d.]+))?/i, version: "\\1", weight: 90 }]
  }
];
