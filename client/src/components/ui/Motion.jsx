import { motion } from "framer-motion";

/**
 * Shared animation building blocks for the whole site.
 * Keep this file as the single source of truth for motion timing/easing
 * so every page feels consistent instead of each component inventing
 * its own animation values.
 */

// Runs once, immediately on mount — use for above-the-fold content
// (hero heading, hero art) that should animate in on first paint.
export function FadeIn({
  children,
  className = "",
  direction = "up", // "up" | "down" | "left" | "right" | "none"
  delay = 0,
  duration = 0.6,
  as = "div",
  ...rest
}) {
  const offset = 24;
  const initialOffset =
    direction === "up"
      ? { y: offset }
      : direction === "down"
      ? { y: -offset }
      : direction === "left"
      ? { x: offset }
      : direction === "right"
      ? { x: -offset }
      : {};

  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag
      initial={{ opacity: 0, ...initialOffset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

// Triggers when the element scrolls into view — use for below-the-fold
// sections (features, programs grid, testimonials, FAQ, etc.).
// `once: true` so it doesn't re-animate every time the user scrolls up/down.
export function Reveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.6,
  amount = 0.2, // how much of the element must be visible before triggering
  as = "div",
  ...rest
}) {
  const offset = 32;
  const initialOffset =
    direction === "up"
      ? { y: offset }
      : direction === "down"
      ? { y: -offset }
      : direction === "left"
      ? { x: offset }
      : direction === "right"
      ? { x: -offset }
      : {};

  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag
      initial={{ opacity: 0, ...initialOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

// Wrap a group of children in this, then give each child a
// `variants={staggerItem}` prop — they'll animate in one-by-one
// instead of all at once. Useful for feature grids, step lists, FAQ items.
export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export { motion };
