import { motion } from "motion/react";

const SIZE = 26;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;

// Circular confidence meter that draws itself in on mount.
export default function ConfidenceRing({ value, level }) {
  return (
    <div className={`ring ring-${level}`} title={`${value}% confidence`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <circle className="ring-track" cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} strokeWidth={STROKE} fill="none" />
        <motion.circle
          className="ring-value"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{ type: "spring", stiffness: 60, damping: 16, delay: 0.15 }}
        />
      </svg>
      <span className="ring-label">{value}</span>
    </div>
  );
}
