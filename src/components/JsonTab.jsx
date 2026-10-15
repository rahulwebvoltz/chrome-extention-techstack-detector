import { motion } from "motion/react";
import { Copy } from "lucide-react";
import { press, rise } from "./ui/motion.js";

const TOKEN = /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

function classify(token) {
  if (token.startsWith('"')) return token.trimEnd().endsWith(":") ? "j-key" : "j-str";
  if (token === "true" || token === "false") return "j-bool";
  if (token === "null") return "j-null";
  return "j-num";
}

// Lightweight JSON syntax highlighting rendered as React nodes (no innerHTML).
function highlight(json) {
  return json.split(TOKEN).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={classify(part)}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

export default function JsonTab({ page, onCopy }) {
  const json = JSON.stringify(page, null, 2);

  return (
    <motion.div className="json-wrap" variants={rise} initial="hidden" animate="show">
      <motion.button className="json-copy" onClick={() => onCopy(json, "JSON copied")} {...press}>
        <Copy size={12} /> Copy
      </motion.button>
      <pre className="json">
        <code>{highlight(json)}</code>
      </pre>
    </motion.div>
  );
}
