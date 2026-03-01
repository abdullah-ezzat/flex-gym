import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export function Counter({ value }: Readonly<{ value: number }>) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}
