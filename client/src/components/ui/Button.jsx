import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionLink = motion(Link);

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  outline: "border border-slate-300 text-navy hover:border-brand hover:text-brand bg-white",
  ghost: "text-navy hover:text-brand",
};

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

// Variant-specific hover shadow-glow — kept subtle so it reads as premium,
// not flashy. Ghost buttons stay shadow-free since they're text-like links.
const hoverGlow = {
  primary: "0 10px 28px rgba(37, 99, 235, 0.35)",
  outline: "0 8px 20px rgba(37, 99, 235, 0.18)",
  ghost: "none",
};

/**
 * Renders as a <Link> when `to` is provided, otherwise a <button>.
 * All variants get a smooth scale + shadow-glow on hover, and a slight
 * press-down scale on tap/click, via Framer Motion.
 */
function Button({ to, href, variant = "primary", size = "md", className = "", children, ...rest }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 ${variants[variant]} ${sizes[size]} ${className}`;

  const motionProps = {
    whileHover: { scale: 1.03, boxShadow: hoverGlow[variant] },
    whileTap: { scale: 0.97 },
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  };

  if (to) {
    return (
      <MotionLink to={to} className={classes} {...motionProps} {...rest}>
        {children}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a href={href} className={classes} {...motionProps} {...rest}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button className={classes} {...motionProps} {...rest}>
      {children}
    </motion.button>
  );
}

export default Button;
