import { useState } from "react";
import { ChevronDown } from "lucide-react";
import RichText from "../RichText";

function AccordionItem({ item, isOpen, onToggle, index }) {
  return (
    <div className="border-b border-slate-200">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${index}`}
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left font-semibold text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span>{item.question}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div id={`faq-panel-${index}`} role="region" className="pb-5 text-muted leading-relaxed">
          <RichText html={item.answer} />
        </div>
      )}
    </div>
  );
}

function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div>
      {items.map((item, index) => (
        <AccordionItem
          key={item.question}
          item={item}
          index={index}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
        />
      ))}
    </div>
  );
}

export default Accordion;
