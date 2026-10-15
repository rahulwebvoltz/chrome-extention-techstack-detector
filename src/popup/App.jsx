import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Braces, Check, Copy, LayoutGrid, Layers, RefreshCw } from "lucide-react";
import Header from "../components/Header.jsx";
import SiteHero from "../components/SiteHero.jsx";
import OverviewTab from "../components/OverviewTab.jsx";
import ResourcesTab from "../components/ResourcesTab.jsx";
import JsonTab from "../components/JsonTab.jsx";
import StateView from "../components/StateView.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import Tabs from "../components/ui/Tabs.jsx";
import Toast from "../components/ui/Toast.jsx";
import { press, rise, slide, spring, stagger } from "../components/ui/motion.js";
import { useTabScan } from "./useTabScan.js";
import { useTheme } from "./useTheme.js";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "resources", label: "Resources", icon: Layers },
  { id: "json", label: "JSON", icon: Braces }
];

export default function App() {
  const { status, data: page, error, scanning, rescan, refreshError } = useTabScan();
  const { theme, cycleTheme } = useTheme();
  const [tab, setTab] = useState("overview");
  const [direction, setDirection] = useState(1);
  const [toast, setToast] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const toastTimer = useRef();

  const ready = status === "ready" && page;

  function changeTab(next) {
    const from = TABS.findIndex((t) => t.id === tab);
    const to = TABS.findIndex((t) => t.id === next);
    setDirection(to > from ? 1 : -1);
    setTab(next);
  }

  function showToast(text, { tone = "ok", duration = 1800 } = {}) {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, tone });
    toastTimer.current = setTimeout(() => setToast(null), duration);
  }

  async function copy(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
    } catch {
      showToast("Copy failed", { tone: "error" });
    }
  }

  // Cached results stay visible when a rescan fails — say so instead of
  // silently showing stale data.
  useEffect(() => {
    if (refreshError) showToast(`Rescan failed — showing previous result. ${refreshError.message}`, { tone: "error", duration: 5000 });
  }, [refreshError]);

  async function copyAll() {
    await copy(JSON.stringify(page, null, 2), "Scan copied as JSON");
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1600);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <Header
          scanning={scanning}
          onRescan={rescan}
          canRescan={status !== "restricted"}
          theme={theme}
          onCycleTheme={cycleTheme}
        />

        <main className="main">
          <AnimatePresence mode="wait">
            {ready ? (
              <motion.div key="ready" className="stack" variants={stagger} initial="hidden" animate="show">
                <SiteHero page={page} scanning={scanning} />

                <motion.div variants={rise}>
                  <Tabs tabs={TABS} active={tab} onChange={changeTab} />
                </motion.div>

                <motion.div variants={rise} className="panel-host">
                  <AnimatePresence mode="wait" custom={direction} initial={false}>
                    <motion.div
                      key={tab}
                      custom={direction}
                      variants={slide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      {tab === "overview" && <OverviewTab page={page} onCopy={copy} />}
                      {tab === "resources" && <ResourcesTab stats={page.stats} />}
                      {tab === "json" && <JsonTab page={page} onCopy={copy} />}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ) : status === "loading" ? (
              <LoadingSkeleton key="loading" />
            ) : (
              <StateView key={status} status={status} error={error} onRetry={rescan} />
            )}
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {ready && (
            <motion.footer
              className="footer"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { ...spring, delay: 0.2 } }}
              exit={{ y: 60, opacity: 0 }}
            >
              <motion.button className="btn" onClick={rescan} disabled={scanning} {...press}>
                <RefreshCw size={14} className={scanning ? "spin" : ""} />
                {scanning ? "Scanning…" : "Rescan"}
              </motion.button>
              <motion.button className="btn btn-primary" onClick={copyAll} {...press}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copiedAll ? "done" : "copy"}
                    className="btn-content"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {copiedAll ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                    {copiedAll ? "Copied" : "Copy JSON"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </motion.footer>
          )}
        </AnimatePresence>

        <Toast message={toast} />
      </div>
    </MotionConfig>
  );
}
