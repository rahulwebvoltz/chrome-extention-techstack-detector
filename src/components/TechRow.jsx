import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import ConfidenceRing from "./ui/ConfidenceRing.jsx";
import TechIcon from "./ui/TechIcon.jsx";
import { LEVELS } from "../detector/engine/confidence.js";
import { rise } from "./ui/motion.js";

const EVIDENCE_LABELS = {
  html: "HTML",
  css: "CSS",
  text: "Text",
  scripts: "Script",
  xhr: "XHR",
  scriptSrc: "Script",
  links: "Link",
  url: "URL",
  meta: "Meta",
  headers: "Header",
  cookies: "Cookie",
  js: "JS",
  jsPrefix: "JS",
  dom: "DOM",
  expando: "DOM",
  cssVars: "CSS",
  implied: "Implied"
};

export default function TechRow({ tech }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.li variants={rise} className={`tech ${open ? "is-open" : ""}`}>
      <button
        className="tech-main"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title={`${tech.name} — ${tech.confidence}% · ${open ? "hide" : "show"} evidence`}
      >
        <TechIcon name={tech.name} color={tech.color} iconFile={tech.iconFile} />
        <span className="tech-body">
          <span className="tech-name">{tech.name}</span>
          <span className="tech-meta">
            {tech.version && <span className="tech-version">{tech.version}</span>}
            <span className={`tech-level level-${tech.level}`}>
              {tech.impliedBy ? `via ${tech.impliedBy}` : LEVELS[tech.level].label}
            </span>
          </span>
        </span>
        <ConfidenceRing value={tech.confidence} level={tech.level} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="evidence"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="evidence-list">
              {tech.evidence.map((e, i) => (
                <li key={i} className="evidence-item">
                  <span className={`evidence-type type-${e.type}`}>{EVIDENCE_LABELS[e.type] ?? e.type}</span>
                  <span className="evidence-text" title={e.key ? `${e.key}: ${e.value}` : e.value}>
                    {e.key && <span className="evidence-key">{e.key}</span>}
                    {e.value}
                  </span>
                  <span className="evidence-weight">+{e.weight}</span>
                </li>
              ))}
            </ul>
            {tech.website && (
              <a className="evidence-link" href={tech.website} target="_blank" rel="noreferrer">
                {new URL(tech.website).hostname.replace(/^www\./, "")} <ExternalLink size={11} />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
