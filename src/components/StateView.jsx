import { motion } from "motion/react";
import { Lock, RefreshCw, TriangleAlert } from "lucide-react";
import { press } from "./ui/motion.js";

const VIEWS = {
  restricted: {
    icon: Lock,
    tone: "neutral",
    title: "This page can't be scanned",
    text: "Chrome blocks extensions on internal pages like chrome:// and the Web Store. Open a regular website to scan it.",
    // gentle float
    animate: { y: [0, -6, 0] },
    transition: { repeat: Infinity, duration: 2.6, ease: "easeInOut" }
  },
  error: {
    icon: TriangleAlert,
    tone: "danger",
    title: "Scan failed",
    text: null,
    // one-shot shake
    animate: { rotate: [0, -10, 10, -6, 6, 0] },
    transition: { duration: 0.6, delay: 0.25 }
  }
};

export default function StateView({ status, error, onRetry }) {
  const view = VIEWS[status];
  const Icon = view.icon;

  return (
    <motion.div
      className="state-view"
      role={status === "error" ? "alert" : "status"}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
    >
      <motion.div
        className={`state-icon tone-${view.tone}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
      >
        <motion.span animate={view.animate} transition={view.transition} className="icon-swap">
          <Icon size={26} />
        </motion.span>
      </motion.div>
      <h2>{view.title}</h2>
      <p>{view.text ?? error?.message ?? "Something went wrong."}</p>
      {status === "error" && (
        <motion.button className="btn" onClick={onRetry} {...press}>
          <RefreshCw size={14} /> Try again
        </motion.button>
      )}
    </motion.div>
  );
}
