import { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";

// Counts up (or down) to `value` with a spring, re-animating on every change.
export default function AnimatedNumber({ value }) {
  const spring = useSpring(0, { stiffness: 90, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}
