import { motion } from "motion/react";
import { Copy, Cpu, FileText, Hash, Languages, Link2, Type } from "lucide-react";
import TechList from "./TechList.jsx";
import { rise, stagger } from "./ui/motion.js";

const DETAILS = [
  { key: "title", label: "Title", icon: Type },
  { key: "description", label: "Description", icon: FileText },
  { key: "generator", label: "Generator", icon: Cpu },
  { key: "language", label: "Language", icon: Languages },
  { key: "charset", label: "Charset", icon: Hash },
  { key: "url", label: "URL", icon: Link2 }
];

export default function OverviewTab({ page, onCopy }) {
  return (
    <motion.div className="stack" variants={stagger} initial="hidden" animate="show">
      <TechList technologies={page.technologies} headersCaptured={page.signals?.headers !== false} />

      <motion.section className="card" variants={rise}>
        <h2 className="card-title">Page details</h2>
        <motion.ul className="details" variants={stagger}>
          {DETAILS.map(({ key, label, icon: Icon }) => {
            const value = page[key];
            return (
              <motion.li key={key} variants={rise}>
                <button
                  className="detail"
                  disabled={!value}
                  onClick={() => onCopy(value, `${label} copied`)}
                  title={value ? `Copy ${label.toLowerCase()}` : undefined}
                >
                  <span className="detail-icon">
                    <Icon size={14} />
                  </span>
                  <span className="detail-body">
                    <span className="detail-label">{label}</span>
                    <span className={`detail-value ${value ? "" : "is-empty"}`}>{value || "Not set"}</span>
                  </span>
                  {value && <Copy size={13} className="detail-copy" />}
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      </motion.section>
    </motion.div>
  );
}
