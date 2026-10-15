import { useState } from "react";
import { Gauge, Lock, Share2, Smartphone, Zap } from "lucide-react";
import ICONS from "../techIcons.generated.js";

// Web standards have no brand logo — give them a meaningful symbol instead
// of a letter tile.
const STANDARD_ICONS = {
  "HTTP/3": Zap,
  "Open Graph": Share2,
  "Priority Hints": Gauge,
  HSTS: Lock,
  PWA: Smartphone
};

// Relative luminance of a #rrggbb colour (0 = black, 1 = white).
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Stable colour per name for technologies without a brand colour (imported packs).
function nameColor(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return `hsl(${Math.abs(hash) % 360} 55% 48%)`;
}

// Icon priority:
//   1. Simple Icons brand logo (crisp, recolourable)
//   2. our symbol for web standards (HTTP/3, PWA…)
//   3. the technology's own icon file shipped with the GPL pack (tech-icons/)
//   4. a coloured letter tile
export default function TechIcon({ name, color, iconFile }) {
  const [fileFailed, setFileFailed] = useState(false);
  const icon = ICONS[name];
  const Standard = STANDARD_ICONS[name];

  if (!icon && Standard) {
    return (
      <span className="tech-logo tech-logo-standard" style={{ "--brand": color ?? "#6366f1" }} aria-hidden="true">
        <Standard size={16} strokeWidth={2.2} />
      </span>
    );
  }

  if (!icon && iconFile && !fileFailed) {
    return (
      <span className="tech-logo tech-logo-file" aria-hidden="true">
        {/* <img>, not inline SVG: third-party SVG scripts can't run */}
        <img src={`tech-icons/${iconFile.split("/").map(encodeURIComponent).join("/")}`} alt="" loading="lazy" onError={() => setFileFailed(true)} />
      </span>
    );
  }

  if (!icon) {
    return (
      <span className="tech-tile" style={{ "--tile": color ?? nameColor(name) }} aria-hidden="true">
        {name.charAt(0)}
      </span>
    );
  }

  // Near-black logos (Next.js, Vercel, X…) would vanish in dark mode — use the text colour.
  const fill = luminance(icon.hex) < 0.04 ? "currentColor" : icon.hex;

  return (
    <span className="tech-logo" style={{ "--brand": icon.hex }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="17" height="17">
        <path d={icon.path} fill={fill} />
      </svg>
    </span>
  );
}
