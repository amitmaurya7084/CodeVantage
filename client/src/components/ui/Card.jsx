import { motion } from "framer-motion";

function Card({ children, className = "", hoverable = false }) {
  if (!hoverable) {
    return (
      <div className={`bg-white rounded-card shadow-card border border-slate-100 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-white rounded-card border border-slate-100 ${className}`}
      initial={{ boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.08)" }}
      whileHover={{
        y: -8,
        boxShadow: "0 20px 40px rgba(37, 99, 235, 0.18), 0 8px 24px rgba(15, 23, 42, 0.12)",
        borderColor: "rgba(37, 99, 235, 0.25)",
      }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default Card;
