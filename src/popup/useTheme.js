import { useEffect, useState } from "react";

const ORDER = ["system", "light", "dark"];
const KEY = "techstack:theme";

// Theme is a popup-only UI preference, so localStorage is enough — and being
// synchronous it avoids a flash of the wrong theme when the popup opens.
function readTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    return ORDER.includes(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // storage unavailable — theme just won't persist
    }
  }, [theme]);

  const cycleTheme = () => setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]);

  return { theme, cycleTheme };
}
