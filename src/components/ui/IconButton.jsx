import { motion } from "motion/react";
import { press } from "./motion.js";

export default function IconButton({ label, children, disabled, ...props }) {
  return (
    <motion.button
      className="icon-btn"
      title={label}
      aria-label={label}
      disabled={disabled}
      {...(disabled ? {} : press)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
