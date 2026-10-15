import { motion } from "motion/react";
import { AppWindow, Braces, Code2, Image, Link2, Palette } from "lucide-react";
import AnimatedNumber from "./ui/AnimatedNumber.jsx";
import { rise, stagger } from "./ui/motion.js";

const STATS = [
  { key: "scripts", label: "Scripts", icon: Code2, tone: "indigo" },
  { key: "externalScripts", label: "External JS", icon: Braces, tone: "violet" },
  { key: "stylesheets", label: "Stylesheets", icon: Palette, tone: "pink" },
  { key: "images", label: "Images", icon: Image, tone: "amber" },
  { key: "links", label: "Links", icon: Link2, tone: "cyan" },
  { key: "iframes", label: "iFrames", icon: AppWindow, tone: "emerald" }
];

function ScriptBreakdown({ total, external }) {
  const inline = Math.max(total - external, 0);
  const extPct = total ? (external / total) * 100 : 0;

  return (
    <motion.section className="card" variants={rise}>
      <div className="card-head">
        <h2 className="card-title">Script sources</h2>
        <span className="muted-sm">{total} total</span>
      </div>
      <div className="bar" role="img" aria-label={`${external} external, ${inline} inline scripts`}>
        <motion.span
          className="bar-seg bar-ext"
          initial={{ width: 0 }}
          animate={{ width: `${extPct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.25 }}
        />
        <motion.span
          className="bar-seg bar-inline"
          initial={{ width: 0 }}
          animate={{ width: `${total ? 100 - extPct : 0}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.35 }}
        />
      </div>
      <div className="legend">
        <span>
          <i className="dot-ext" /> External <b>{external}</b>
        </span>
        <span>
          <i className="dot-inline" /> Inline <b>{inline}</b>
        </span>
      </div>
    </motion.section>
  );
}

export default function ResourcesTab({ stats }) {
  return (
    <motion.div className="stack" variants={stagger} initial="hidden" animate="show">
      <motion.div className="stat-grid" variants={stagger}>
        {STATS.map(({ key, label, icon: Icon, tone }) => (
          <motion.div
            key={key}
            className={`stat tone-${tone}`}
            variants={rise}
            whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 20 } }}
          >
            <span className="stat-icon">
              <Icon size={14} />
            </span>
            <span className="stat-value">
              <AnimatedNumber value={stats[key] ?? 0} />
            </span>
            <span className="stat-label">{label}</span>
          </motion.div>
        ))}
      </motion.div>

      <ScriptBreakdown total={stats.scripts ?? 0} external={stats.externalScripts ?? 0} />
    </motion.div>
  );
}
