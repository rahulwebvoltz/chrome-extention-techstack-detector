// Shared animation presets so every surface moves with the same rhythm.

export const spring = { type: "spring", stiffness: 420, damping: 32 };
export const softSpring = { type: "spring", stiffness: 260, damping: 26 };

// Parent: <motion.div variants={stagger} initial="hidden" animate="show">
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } }
};

// Child of a stagger parent
export const rise = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: softSpring }
};

// Directional slide for tab panels; `custom` = +1 (forward) / -1 (back)
export const slide = {
  enter: (dir) => ({ opacity: 0, x: dir * 28, filter: "blur(4px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir * -28, filter: "blur(4px)", transition: { duration: 0.15 } })
};

export const press = { whileHover: { scale: 1.04 }, whileTap: { scale: 0.94 } };
