import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import { spring } from "./motion.js";

export default function Toast({ message }) {
  return (
    <div className="toast-region" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message.id}
            className="toast"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: spring }}
            exit={{ opacity: 0, y: 8, scale: 0.95, transition: { duration: 0.15 } }}
          >
            <span className={`toast-icon ${message.tone === "error" ? "is-error" : ""}`}>
              {message.tone === "error" ? <X size={12} strokeWidth={3} /> : <Check size={12} strokeWidth={3} />}
            </span>
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
