import { useEffect, useState } from "react";
import LegalPage from "../../components/legal/LegalPage";
import { fetchContent } from "../../services/contentService";

function Privacy() {
  const [sections, setSections] = useState(null);

  useEffect(() => {
    fetchContent(["legal.privacy"])
      .then((data) => {
        if (data["legal.privacy"]?.sections) setSections(data["legal.privacy"].sections);
      })
      .catch(() => {
        // Keep static fallback below.
      });
  }, []);

  return (
    <LegalPage title="Privacy Policy" lastUpdated="[Insert Date]" dynamicSections={sections}>
      <p>
        This Privacy Policy explains how CodeVantage ("we", "us") collects, uses, and protects
        information when you use our website and internship platform.
      </p>

      <h2>Information We Collect</h2>
      <p>
        When you register, we collect your full name, email address, phone number, college/school,
        course, and optionally your GitHub and LinkedIn URLs. When you submit projects, we store
        the URLs and descriptions you provide. When you pay the certificate fee, payment
        processing is handled by our payment gateway partner; we store transaction references but
        never your raw card or bank details.
      </p>

      <h2>How We Use Your Information</h2>
      <p>
        We use your information to manage your internship account, assign tasks, review
        submissions, process certificate payments, generate certificates, and send you relevant
        email notifications about your progress.
      </p>

      <h2>Data Storage & Security</h2>
      <p>
        Passwords are stored using industry-standard hashing and are never stored or displayed in
        plain text. We apply reasonable technical safeguards to protect your data from unauthorized
        access.
      </p>

      <h2>Data Sharing</h2>
      <p>
        We do not sell your personal data. We share only what's necessary with our payment gateway
        (for processing the certificate fee) and email service provider (for notifications).
      </p>

      <h2>Certificate Verification</h2>
      <p>
        Our public certificate verification page shows only limited information (student name,
        program, duration, completion date, certificate ID, and status) — it never exposes your
        email, phone number, or other private details.
      </p>

      <h2>Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data by contacting
        us at support@codevantage.in.
      </p>

      <h2>Contact</h2>
      <p>Questions about this policy can be sent to support@codevantage.in.</p>
    </LegalPage>
  );
}

export default Privacy;
