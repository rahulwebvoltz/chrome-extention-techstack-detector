import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, Languages, ShieldAlert, ShieldCheck } from "lucide-react";
import { formatRelativeTime } from "../utils/url.js";
import { useNow } from "../popup/useNow.js";
import { rise, stagger } from "./ui/motion.js";

export default function SiteHero({ page, scanning }) {
  const [iconFailed, setIconFailed] = useState(false);
  const now = useNow();
  const secure = page.protocol === "https";

  return (
    <motion.section className="hero" variants={rise}>
      <div className="hero-aurora" aria-hidden="true" />

      {/* Light sweep while a scan is running */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            className="scan-sweep"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.span
              className="scan-beam"
              initial={{ x: "-120%" }}
              animate={{ x: "320%" }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hero-body">
        <div className="favicon-wrap">
          <AnimatePresence>
            {scanning &&
              [0, 1].map((i) => (
                <motion.span
                  key={i}
                  className="radar-ring"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  // own exit transition — otherwise it inherits repeat: Infinity and never leaves
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.7, ease: "easeOut" }}
                />
              ))}
          </AnimatePresence>
          <motion.div
            className="favicon"
            initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.05 }}
          >
            {page.favicon && !iconFailed ? (
              <img src={page.favicon} alt="" onError={() => setIconFailed(true)} />
            ) : (
              <span>{page.hostname.charAt(0).toUpperCase()}</span>
            )}
          </motion.div>
        </div>

        <div className="hero-text">
          <motion.h1
            key={page.hostname}
            className="hero-host"
            title={page.hostname}
            initial={{ opacity: 0, filter: "blur(8px)", y: 4 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {page.hostname}
          </motion.h1>
          <p className="hero-url" title={page.url}>
            {page.url}
          </p>
        </div>

        <motion.div className="chips" variants={stagger} initial="hidden" animate="show">
        <motion.span variants={rise} className={`chip ${secure ? "chip-ok" : "chip-warn"}`}>
          {secure ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
          {secure ? "Secure" : "Not secure"}
        </motion.span>
        {page.language && (
          <motion.span variants={rise} className="chip">
            <Languages size={12} />
            {page.language}
          </motion.span>
        )}
        <motion.span variants={rise} className="chip">
          <Clock size={12} />
          {scanning ? "Scanning…" : formatRelativeTime(page.scannedAt, now)}
        </motion.span>
        </motion.div>
      </div>
    </motion.section>
  );
}
