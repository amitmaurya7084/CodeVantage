import { useEffect, useState } from "react";
import LegalPage from "../../components/legal/LegalPage";
import { fetchContent } from "../../services/contentService";

function CertificatePolicy() {
  const [sections, setSections] = useState(null);

  useEffect(() => {
    fetchContent(["legal.certificatePolicy"])
      .then((data) => {
        if (data["legal.certificatePolicy"]?.sections) setSections(data["legal.certificatePolicy"].sections);
      })
      .catch(() => {
        // Keep static fallback below.
      });
  }, []);

  return (
    <LegalPage title="Certificate Policy" lastUpdated="[Insert Date]" dynamicSections={sections}>
      <h2>Eligibility</h2>
      <p>
        A student becomes certificate-eligible only when all assigned project tasks for their
        program are marked "Approved" by an administrator. Certificate eligibility is calculated
        directly from task status — it is never manually overridden without approvals in place.
      </p>

      <h2>Payment</h2>
      <p>
        Once eligible, a one-time ₹149 certificate processing fee applies. Payment is verified
        server-side with our payment gateway before any certificate is generated — a frontend
        "payment successful" message alone never triggers certificate issuance.
      </p>

      <h2>Certificate Content</h2>
      <p>
        Each certificate displays the student's name, program, duration, completion date, and a
        unique certificate ID in the format CV-[PROGRAM]-[YEAR]-[NUMBER] (e.g. CV-WD-2026-000001).
        CodeVantage does not add any government, ISO, or third-party accreditation logos to
        certificates, as we hold no such accreditation.
      </p>

      <h2>Verification</h2>
      <p>
        Every certificate includes a QR code linking to a public verification page
        (/verify/[certificate-id]) where anyone can confirm the certificate's authenticity without
        needing to log in.
      </p>

      <h2>Certificate Revocation</h2>
      <p>
        CodeVantage reserves the right to revoke a certificate if it is later found that a
        submission involved plagiarism or fraudulent information.
      </p>
    </LegalPage>
  );
}

export default CertificatePolicy;
