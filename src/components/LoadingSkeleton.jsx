import { motion } from "motion/react";

// Mirrors the real layout so content swaps in without a jump.
export default function LoadingSkeleton() {
  return (
    <motion.div
      className="stack"
      role="status"
      aria-label="Scanning page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="hero hero-skeleton">
        <div className="hero-body">
          <span className="skeleton sk-favicon" />
          <div className="hero-text">
            <span className="skeleton sk-line" style={{ width: "60%", height: 16 }} />
            <span className="skeleton sk-line" style={{ width: "85%" }} />
          </div>
          <div className="chips">
            {[64, 48, 72].map((w) => (
              <span key={w} className="skeleton sk-chip" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>
      <span className="skeleton sk-tabs" />
      <div className="card">
        {[90, 70, 80, 55].map((w) => (
          <div className="sk-row" key={w}>
            <span className="skeleton sk-dot" />
            <span className="skeleton sk-line" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
