function Badge({ children, tone = "brand", className = "" }) {
  const tones = {
    brand: "bg-brand/10 text-brand",
    solid: "bg-brand text-white",
    sky: "bg-blue-100 text-blue-700",
    cyan: "bg-cyan/10 text-cyan-700",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    neutral: "bg-slate-100 text-muted",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
