import { motion } from "motion/react";
import { spring } from "./motion.js";

// Segmented tabs with a pill that glides between items (shared layoutId).
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(({ id, label, icon: Icon }) => {
        const selected = id === active;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={selected}
            className={`tab ${selected ? "is-active" : ""}`}
            onClick={() => onChange(id)}
          >
            {selected && <motion.span layoutId="tab-pill" className="tab-pill" transition={spring} />}
            <Icon size={14} strokeWidth={2.2} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
