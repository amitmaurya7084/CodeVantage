import { useEffect, useState } from "react";
import LegalPage from "../../components/legal/LegalPage";
import { fetchContent } from "../../services/contentService";

function RefundPolicy() {
  const [sections, setSections] = useState(null);

  useEffect(() => {
    fetchContent(["legal.refundPolicy"])
      .then((data) => {
        if (data["legal.refundPolicy"]?.sections) setSections(data["legal.refundPolicy"].sections);
      })
      .catch(() => {
        // Keep static fallback below.
      });
  }, []);

  return (
    <LegalPage title="Refund Policy" lastUpdated="[Insert Date]" dynamicSections={sections}>
      <h2>Certificate Fee (₹149)</h2>
      <p>
        The ₹149 certificate processing fee is charged only after a student becomes
        certificate-eligible (all 3 tasks approved). Because this fee covers the immediate
        generation of your certificate, unique certificate ID, and QR verification record, it is
        generally <strong>non-refundable</strong> once the certificate has been successfully
        generated.
      </p>

      <h2>When a Refund May Apply</h2>
      <ul>
        <li>The payment was deducted but the certificate was not generated due to a technical or system error.</li>
        <li>A duplicate payment was made for the same certificate in error.</li>
      </ul>

      <h2>How to Request a Refund</h2>
      <p>
        Contact support@codevantage.in within 7 days of the payment, including your registered
        email and the payment/order ID. Verified eligible refunds are processed back to the
        original payment method within a reasonable timeframe.
      </p>

      <h2>Internship Program Itself</h2>
      <p>
        Registration for the internship program is free of charge; only the post-completion
        certificate fee is paid, so no refund applies to program participation itself.
      </p>
    </LegalPage>
  );
}

export default RefundPolicy;
