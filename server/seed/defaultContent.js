// Shared default SiteContent data — used by both the CLI seed script
// (npm run seed:content) and the automatic "seed if empty" check the
// server runs on startup, so the two never drift out of sync.
const contentBlocks = [
  {
    key: "home.hero",
    label: "Homepage Hero Section",
    group: "Homepage",
    data: {
      badge: "Project-Based Learning for a Better Tomorrow",
      headingLine1: "Build Skills.",
      headingLine2: "Create Projects.",
      headingLine3: "Get Certified.",
      description:
        "Build practical skills through a structured, project-based internship program and create real projects for your portfolio.",
      ctaPrimaryText: "Apply for Internship",
      ctaSecondaryText: "See How It Works",
    },
  },
  {
    key: "home.techTools",
    label: "Homepage: Technologies & Tools Strip",
    group: "Homepage",
    data: {
      items: ["HTML", "CSS", "JavaScript", "GitHub", "VS Code", "PHP", "MySQL", "Python"],
    },
  },
  {
    key: "home.finalCta",
    label: "Homepage: Final Call-to-Action Banner",
    group: "Homepage",
    data: {
      heading: "Start Your Learning Journey Today",
      description: "Join CodeVantage and turn your learning into real-world projects.",
    },
  },
  {
    key: "about.mission",
    label: "About: Our Mission",
    group: "About Page",
    data: {
      text:
        "To bridge the gap between academic learning and real-world development skills by giving students structured, project-based work with genuine review and feedback.",
    },
  },
  {
    key: "about.vision",
    label: "About: Our Vision",
    group: "About Page",
    data: {
      text:
        "A world where anyone motivated to learn can build a credible, project-based portfolio — regardless of their starting point.",
    },
  },
  {
    key: "about.values",
    label: "About: Our Values",
    group: "About Page",
    data: {
      items: [
        "Honesty — no inflated claims, no fake numbers",
        "Rigor — certificates are earned through real review, not just payment",
        "Accessibility — virtual, self-paced, and affordable",
      ],
    },
  },
  {
    key: "about.whatWeOffer",
    label: "About: What We Offer",
    group: "About Page",
    data: {
      text:
        "Structured internship programs with real project tasks, expert review of every submission, and a QR-verifiable Certificate of Internship Completion upon successful completion.",
    },
  },
  {
    key: "contact.info",
    label: "Contact Information",
    group: "Site Settings",
    data: {
      supportEmail: "support@codevantage.in",
      phone: "",
      address: "",
      social: { linkedin: "", instagram: "", youtube: "", twitter: "" },
    },
  },
  {
    key: "settings.branding",
    label: "Site Branding",
    group: "Site Settings",
    data: {
      siteName: "CodeVantage",
      tagline: "Build Skills. Create Projects. Get Certified.",
      topBarText: "Project-Based Learning • Real Skills • Recognized Certificates",
    },
  },
  {
    key: "settings.logo",
    label: "Site Logo",
    group: "Site Settings",
    data: { url: "" },
  },
  {
    key: "settings.upiPayment",
    label: "UPI Payment Settings",
    group: "Site Settings",
    data: {
      upiId: "",
      payeeName: "CodeVantage",
      qrImageUrl: "",
    },
  },
  {
    key: "legal.privacy",
    label: "Privacy Policy",
    group: "Legal Pages",
    data: {
      sections: [
        {
          heading: "Information We Collect",
          body: "When you register, we collect your full name, email address, phone number, college/school, course, and optionally your GitHub and LinkedIn URLs. When you submit projects, we store the URLs and descriptions you provide. When you pay the certificate fee, payment processing is handled by our payment gateway partner; we store transaction references but never your raw card or bank details.",
        },
        {
          heading: "How We Use Your Information",
          body: "We use your information to manage your internship account, assign tasks, review submissions, process certificate payments, generate certificates, and send you relevant email notifications about your progress.",
        },
        {
          heading: "Data Storage & Security",
          body: "Passwords are stored using industry-standard hashing and are never stored or displayed in plain text. We apply reasonable technical safeguards to protect your data from unauthorized access.",
        },
        {
          heading: "Data Sharing",
          body: "We do not sell your personal data. We share only what's necessary with our payment gateway (for processing the certificate fee) and email service provider (for notifications).",
        },
        {
          heading: "Certificate Verification",
          body: "Our public certificate verification page shows only limited information (student name, program, duration, completion date, certificate ID, and status) — it never exposes your email, phone number, or other private details.",
        },
        {
          heading: "Your Rights",
          body: "You may request access to, correction of, or deletion of your personal data by contacting us at support@codevantage.in.",
        },
        { heading: "Contact", body: "Questions about this policy can be sent to support@codevantage.in." },
      ],
    },
  },
  {
    key: "legal.terms",
    label: "Terms & Conditions",
    group: "Legal Pages",
    data: {
      sections: [
        {
          heading: "Program Nature",
          body: "CodeVantage offers virtual, project-based internship programs. This is a skill-building and portfolio-development program, not a guarantee of employment or job placement.",
        },
        {
          heading: "Student Responsibilities",
          body: "You are responsible for completing your own project work, submitting accurate GitHub and live project URLs, and responding to reviewer feedback in a timely manner.",
        },
        {
          heading: "Certificate Eligibility",
          body: "A Certificate of Internship Completion is issued only after all assigned projects are reviewed and approved, and the applicable certificate processing fee (₹149) has been paid and verified. Payment alone does not entitle you to a certificate.",
        },
        {
          heading: "Account Conduct",
          body: "You agree not to submit plagiarized work, share your account credentials, or attempt to access administrator systems. Violations may result in suspension of your account.",
        },
        {
          heading: "No Guarantees",
          body: "CodeVantage does not claim government, UGC, or AICTE approval, ISO certification, or guaranteed job placement. Any such claim found elsewhere is not authorized by us.",
        },
        {
          heading: "Changes to These Terms",
          body: "We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance.",
        },
        { heading: "Contact", body: "Questions about these terms can be sent to support@codevantage.in." },
      ],
    },
  },
  {
    key: "legal.refundPolicy",
    label: "Refund Policy",
    group: "Legal Pages",
    data: {
      sections: [
        {
          heading: "Certificate Fee (₹149)",
          body: "The ₹149 certificate processing fee is charged only after a student becomes certificate-eligible (all 3 tasks approved). Because this fee covers the immediate generation of your certificate, unique certificate ID, and QR verification record, it is generally non-refundable once the certificate has been successfully generated.",
        },
        {
          heading: "When a Refund May Apply",
          body: "The payment was deducted but the certificate was not generated due to a technical or system error, or a duplicate payment was made for the same certificate in error.",
        },
        {
          heading: "How to Request a Refund",
          body: "Contact support@codevantage.in within 7 days of the payment, including your registered email and the payment/order ID. Verified eligible refunds are processed back to the original payment method within a reasonable timeframe.",
        },
        {
          heading: "Internship Program Itself",
          body: "Registration for the internship program is free of charge; only the post-completion certificate fee is paid, so no refund applies to program participation itself.",
        },
      ],
    },
  },
  {
    key: "legal.internshipPolicy",
    label: "Internship Policy",
    group: "Legal Pages",
    data: {
      sections: [
        {
          heading: "Program Structure",
          body: "Each internship program runs for 1 month, is fully virtual, and consists of 3 project tasks. Students may work at their own pace within the program duration.",
        },
        {
          heading: "Task Assignment",
          body: "Upon registration, a student is automatically assigned their selected program and its associated tasks. Task instructions, requirements, and expected outputs are provided in full on the student dashboard.",
        },
        {
          heading: "Review Process",
          body: "Every submission is reviewed by the CodeVantage team and marked Approved, Rejected, or Changes Requested, with written comments. Students may revise and resubmit a task any number of times until it is approved.",
        },
        {
          heading: "Internship Status",
          body: "A student's internship status is \"Active\" until all tasks are approved, at which point it becomes \"Completed.\" Certificate eligibility is calculated automatically from actual task approval status.",
        },
        {
          heading: "Termination",
          body: "CodeVantage reserves the right to suspend an account for plagiarism, abusive behavior, or violation of the Terms & Conditions.",
        },
      ],
    },
  },
  {
    key: "legal.certificatePolicy",
    label: "Certificate Policy",
    group: "Legal Pages",
    data: {
      sections: [
        {
          heading: "Eligibility",
          body: "A student becomes certificate-eligible only when all assigned project tasks for their program are marked \"Approved\" by an administrator. Certificate eligibility is calculated directly from task status — it is never manually overridden without approvals in place.",
        },
        {
          heading: "Payment",
          body: "Once eligible, a one-time ₹149 certificate processing fee applies. Payment is verified server-side with our payment gateway before any certificate is generated — a frontend \"payment successful\" message alone never triggers certificate issuance.",
        },
        {
          heading: "Certificate Content",
          body: "Each certificate displays the student's name, program, duration, completion date, and a unique certificate ID in the format CV-[PROGRAM]-[YEAR]-[NUMBER] (e.g. CV-WD-2026-000001). CodeVantage does not add any government, ISO, or third-party accreditation logos to certificates, as we hold no such accreditation.",
        },
        {
          heading: "Verification",
          body: "Every certificate includes a QR code linking to a public verification page (/verify/[certificate-id]) where anyone can confirm the certificate's authenticity without needing to log in.",
        },
        {
          heading: "Certificate Revocation",
          body: "CodeVantage reserves the right to revoke a certificate if it is later found that a submission involved plagiarism or fraudulent information.",
        },
      ],
    },
  },
];

module.exports = { contentBlocks };
