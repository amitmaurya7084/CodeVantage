import { useEffect, useState } from "react";
import LegalPage from "../../components/legal/LegalPage";
import { fetchContent } from "../../services/contentService";

function Terms() {
  const [sections, setSections] = useState(null);

  useEffect(() => {
    fetchContent(["legal.terms"])
      .then((data) => {
        if (data["legal.terms"]?.sections) setSections(data["legal.terms"].sections);
      })
      .catch(() => {
        // Keep static fallback below.
      });
  }, []);

  return (
    <LegalPage title="Terms & Conditions" lastUpdated="[Insert Date]" dynamicSections={sections}>
      <p>
        By registering for a CodeVantage internship program, you agree to the following terms.
      </p>

      <h2>Program Nature</h2>
      <p>
        CodeVantage offers virtual, project-based internship programs. This is a skill-building and
        portfolio-development program, not a guarantee of employment or job placement.
      </p>

      <h2>Student Responsibilities</h2>
      <p>
        You are responsible for completing your own project work, submitting accurate GitHub and
        live project URLs, and responding to reviewer feedback in a timely manner.
      </p>

      <h2>Certificate Eligibility</h2>
      <p>
        A Certificate of Internship Completion is issued only after all assigned projects are
        reviewed and approved, and the applicable certificate processing fee (₹149) has been paid
        and verified. Payment alone does not entitle you to a certificate.
      </p>

      <h2>Account Conduct</h2>
      <p>
        You agree not to submit plagiarized work, share your account credentials, or attempt to
        access administrator systems. Violations may result in suspension of your account.
      </p>

      <h2>No Guarantees</h2>
      <p>
        CodeVantage does not claim government, UGC, or AICTE approval, ISO certification, or
        guaranteed job placement. Any such claim found elsewhere is not authorized by us.
      </p>

      <h2>Changes to These Terms</h2>
      <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance.</p>

      <h2>Contact</h2>
      <p>Questions about these terms can be sent to support@codevantage.in.</p>
    </LegalPage>
  );
}

export default Terms;
