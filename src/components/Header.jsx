import { AnimatePresence, motion } from "motion/react";
import { Monitor, Moon, RefreshCw, ScanSearch, Sun } from "lucide-react";
import IconButton from "./ui/IconButton.jsx";

const THEME_ICONS = { system: Monitor, light: Sun, dark: Moon };

// Shown in the header so it's obvious which build is loaded (unpacked
// extensions keep running the old code until reloaded in chrome://extensions).
const VERSION = globalThis.chrome?.runtime?.getManifest?.().version;

export default function Header({ scanning, onRescan, canRescan, theme, onCycleTheme }) {
  const ThemeIcon = THEME_ICONS[theme];

  return (
    <header className="header">
      <div className="brand">
        <div className={`brand-mark ${scanning ? "is-scanning" : ""}`}>
          <ScanSearch size={16} strokeWidth={2.4} />
        </div>
        <div className="brand-text">
          <span className="brand-name">TechStack</span>
          <span className="brand-sub">Detector{VERSION && ` · v${VERSION}`}</span>
        </div>
      </div>

      <div className="header-actions">
        <IconButton label={`Theme: ${theme}`} onClick={onCycleTheme}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              className="icon-swap"
              initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ThemeIcon size={15} />
            </motion.span>
          </AnimatePresence>
        </IconButton>

        <IconButton label="Rescan page" onClick={onRescan} disabled={!canRescan || scanning}>
          <RefreshCw size={15} className={scanning ? "spin" : ""} />
        </IconButton>
      </div>
    </header>
  );
}
