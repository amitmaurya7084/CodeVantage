import Badge from "./Badge";

function SectionHeading({ eyebrow, title, description, align = "left", highlightLast = 0 }) {
  let titleContent = title;

  if (highlightLast > 0 && typeof title === "string") {
    const words = title.trim().split(" ");
    const highlighted = words.splice(-highlightLast, highlightLast);
    titleContent = (
      <>
        {words.length ? `${words.join(" ")} ` : ""}
        <span className="text-brand">{highlighted.join(" ")}</span>
      </>
    );
  }

  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""} mb-10`}>
      {eyebrow && <Badge className="mb-4">{eyebrow}</Badge>}
      <h2 className="text-h2 text-navy">{titleContent}</h2>
      {description && <p className="text-body-lg mt-3 text-muted">{description}</p>}
    </div>
  );
}

export default SectionHeading;
