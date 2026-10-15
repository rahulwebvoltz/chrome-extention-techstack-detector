import { motion } from "motion/react";
import { Info, SearchX, Sparkles } from "lucide-react";
import TechRow from "./TechRow.jsx";
import { categoryIcon } from "./categoryIcons.js";
import { categoryOf } from "../detector/categories.js";
import { rise, stagger } from "./ui/motion.js";

function groupByCategory(technologies) {
  const groups = new Map();
  for (const tech of technologies) {
    if (!groups.has(tech.category)) groups.set(tech.category, []);
    groups.get(tech.category).push(tech);
  }
  return [...groups]; // already in category order — the engine sorts results
}

// Masonry: put each group in whichever column is currently shorter. Two
// independent columns (not CSS `columns`) so expanding one technology's
// evidence doesn't reflow groups between columns.
function splitIntoColumns(groups) {
  const columns = [[], []];
  const heights = [0, 0];
  for (const group of groups) {
    const target = heights[0] <= heights[1] ? 0 : 1;
    columns[target].push(group);
    heights[target] += 1.2 + group[1].length; // header ≈ 1.2 rows
  }
  return columns;
}

function Group({ category, techs }) {
  const Icon = categoryIcon(category);
  return (
    <motion.div className="tech-group" variants={rise}>
      <h3 className="tech-group-title">
        <Icon size={12} /> {techs[0].categoryLabel ?? categoryOf(category).label}
        <span className="tech-group-count">{techs.length}</span>
      </h3>
      <motion.ul className="tech-items" variants={stagger}>
        {techs.map((tech) => (
          <TechRow key={tech.name} tech={tech} />
        ))}
      </motion.ul>
    </motion.div>
  );
}

function GhostRows() {
  return (
    <div className="ghost-list" aria-hidden="true">
      {[72, 54, 64].map((w, i) => (
        <div className="ghost-row" key={i}>
          <span className="skeleton ghost-icon" />
          <span className="skeleton ghost-line" style={{ width: `${w}%` }} />
          <span className="skeleton ghost-pill" />
        </div>
      ))}
    </div>
  );
}

// Headers are only captured while a page loads. A tab loaded before the
// extension was (re)loaded has none — say so instead of silently missing
// servers, CDNs and services listed in the security policy.
function HeadersNotice() {
  return (
    <p className="tech-notice">
      <Info size={13} />
      <span>
        Response headers weren't captured for this tab. <b>Reload the page</b> to also detect web servers, CDNs and
        services listed in its security policy.
      </span>
    </p>
  );
}

export default function TechList({ technologies, headersCaptured = true }) {
  const loading = !Array.isArray(technologies);
  const confirmed = technologies?.filter((t) => t.level === "confirmed").length ?? 0;

  return (
    <motion.section className="card tech-preview" variants={rise}>
      <div className="card-head">
        <h2 className="card-title">
          <Sparkles size={14} /> Technologies
        </h2>
        {!loading && <span className="badge-soon">{technologies.length} found</span>}
      </div>

      {!loading && !headersCaptured && <HeadersNotice />}

      {loading ? (
        <GhostRows />
      ) : technologies.length === 0 ? (
        <div className="tech-empty">
          <SearchX size={20} />
          <p>No known technologies detected on this page.</p>
        </div>
      ) : (
        <>
          <p className="tech-summary">
            {confirmed} confirmed · tap a technology to see the evidence
          </p>
          <motion.div className="tech-columns" variants={stagger} initial="hidden" animate="show">
            {splitIntoColumns(groupByCategory(technologies)).map((column, i) => (
              <motion.div className="tech-column" key={i} variants={stagger}>
                {column.map(([category, techs]) => (
                  <Group key={category} category={category} techs={techs} />
                ))}
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </motion.section>
  );
}
