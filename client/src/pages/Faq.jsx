import { useEffect, useState } from "react";
import SectionHeading from "../components/ui/SectionHeading";
import Accordion from "../components/ui/Accordion";
import Container from "../components/ui/Container";
import Seo from "../components/Seo";
import { faqs as staticFaqs } from "../data/faqs";
import { fetchFaqs } from "../services/faqService";

function Faq() {
  const [faqs, setFaqs] = useState(staticFaqs);

  useEffect(() => {
    fetchFaqs()
      .then((data) => {
        if (data && data.length > 0) setFaqs(data);
      })
      .catch(() => {
        // Keep static fallback.
      });
  }, []);

  return (
    <Container size="md">
      <Seo title="FAQ" description="Frequently asked questions about the CodeVantage internship program." path="/faq" />
      <SectionHeading
        eyebrow="Support"
        title="Frequently Asked Questions"
        description="Everything you need to know about the internship, reviews, and certification."
        align="center"
      />
      <Accordion items={faqs} />
    </Container>
  );
}

export default Faq;
