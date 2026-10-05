/**
 * Escapes user/admin-supplied text before it goes into an HTML email body.
 * Without this, a review comment like "wrap it in a <div>" silently loses the
 * tag text in the student's inbox, and names/comments could inject markup or links.
 * (Subject lines are plain text and are NOT escaped.)
 */
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escapes, then keeps the author's line breaks. */
function escMultiline(value) {
  return esc(value).replace(/\r?\n/g, "<br />");
}

const CERTIFICATE_FEE = Number(process.env.CERTIFICATE_FEE_INR) || 149;

function baseTemplate(title, bodyHtml) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #F8FAFC;">
    <div style="background: #0F172A; padding: 24px 32px;">
      <span style="color: #FFFFFF; font-size: 20px; font-weight: 700;">CodeVantage</span>
    </div>
    <div style="background: #FFFFFF; padding: 32px;">
      <h1 style="color: #0F172A; font-size: 20px; margin: 0 0 16px;">${title}</h1>
      ${bodyHtml}
    </div>
    <div style="padding: 20px 32px; color: #64748B; font-size: 12px;">
      CodeVantage — Build Skills. Create Projects. Get Certified.<br />
      support@codevantage.in
    </div>
  </div>`;
}

function studentRegisteredEmail(student, programName) {
  return {
    subject: "Welcome to CodeVantage!",
    html: baseTemplate(
      `Welcome, ${esc(student.fullName)}!`,
      `<p style="color:#334155;line-height:1.6;">
         Your registration for the <strong>${esc(programName)}</strong> internship is confirmed.
         Log in to your dashboard to view your assigned tasks and get started.
       </p>`
    ),
  };
}

function submissionReceivedEmail(student, taskTitle) {
  return {
    subject: `Submission Received: ${taskTitle}`,
    html: baseTemplate(
      "Submission Received",
      `<p style="color:#334155;line-height:1.6;">
         Hi ${esc(student.fullName)}, we've received your submission for <strong>${esc(taskTitle)}</strong>.
         Our team will review it and update its status on your dashboard.
       </p>`
    ),
  };
}

function reviewDecisionEmail(student, taskTitle, decision, comments) {
  const decisionCopy = {
    Approved: { subject: `Task Approved: ${taskTitle}`, heading: "Your Submission Was Approved 🎉" },
    Rejected: { subject: `Submission Update: ${taskTitle}`, heading: "Your Submission Needs Attention" },
    "Changes Requested": { subject: `Changes Requested: ${taskTitle}`, heading: "Changes Requested on Your Submission" },
  }[decision];

  return {
    subject: decisionCopy.subject,
    html: baseTemplate(
      decisionCopy.heading,
      `<p style="color:#334155;line-height:1.6;">
         Hi ${esc(student.fullName)}, your submission for <strong>${esc(taskTitle)}</strong> was marked
         <strong>${esc(decision)}</strong>.
       </p>
       <div style="background:#F8FAFC;border-left:4px solid #2563EB;padding:12px 16px;margin-top:12px;color:#334155;">
         ${escMultiline(comments)}
       </div>`
    ),
  };
}

function allTasksApprovedEmail(student) {
  return {
    subject: "You're Certificate Eligible!",
    html: baseTemplate(
      "All Tasks Approved 🎉",
      `<p style="color:#334155;line-height:1.6;">
         Congratulations, ${esc(student.fullName)}! All your projects have been approved.
         You can now pay the ₹${CERTIFICATE_FEE} certificate processing fee from your dashboard to receive
         your Certificate of Internship Completion.
       </p>`
    ),
  };
}

function paymentSuccessfulEmail(student, amount) {
  return {
    subject: "Payment Successful",
    html: baseTemplate(
      "Payment Received",
      `<p style="color:#334155;line-height:1.6;">
         Hi ${esc(student.fullName)}, we've received your ₹${esc(amount)} certificate processing fee.
         Your certificate is being generated and will be available on your dashboard shortly.
       </p>`
    ),
  };
}

function certificateGeneratedEmail(student, certificateId, verificationUrl) {
  return {
    subject: "Your Certificate Is Ready!",
    html: baseTemplate(
      "Certificate Generated 🎓",
      `<p style="color:#334155;line-height:1.6;">
         Congratulations, ${esc(student.fullName)}! Your Certificate of Internship Completion is ready.
       </p>
       <p style="color:#334155;line-height:1.6;">
         <strong>Certificate ID:</strong> ${esc(certificateId)}<br/>
         <a href="${esc(verificationUrl)}" style="color:#2563EB;">View public verification page</a>
       </p>
       <p style="color:#334155;line-height:1.6;">Log in to your dashboard to download the PDF.</p>`
    ),
  };
}

function paymentRejectedEmail(student, reason) {
  return {
    subject: "Payment Verification Needed",
    html: baseTemplate(
      "We Couldn't Verify Your Payment",
      `<p style="color:#334155;line-height:1.6;">
         Hi ${esc(student.fullName)}, we reviewed the payment screenshot you submitted but couldn't verify it.
       </p>
       ${reason ? `<p style="color:#334155;line-height:1.6;"><strong>Reason:</strong> ${escMultiline(reason)}</p>` : ""}
       <p style="color:#334155;line-height:1.6;">
         Please log in to your dashboard and resubmit a clear screenshot of your UPI payment along with the transaction ID (UTR).
       </p>`
    ),
  };
}

function forgotPasswordEmail(student, resetUrl) {
  return {
    subject: "Reset Your CodeVantage Password",
    html: baseTemplate(
      "Password Reset Request",
      `<p style="color:#334155;line-height:1.6;">
         Hi ${esc(student.fullName)}, we received a request to reset your password. This link expires
         in 1 hour. If you didn't request this, you can safely ignore this email.
       </p>
       <p style="margin-top:16px;">
         <a href="${esc(resetUrl)}" style="background:#2563EB;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
           Reset Password
         </a>
       </p>`
    ),
  };
}

module.exports = {
  studentRegisteredEmail,
  submissionReceivedEmail,
  reviewDecisionEmail,
  allTasksApprovedEmail,
  paymentSuccessfulEmail,
  paymentRejectedEmail,
  certificateGeneratedEmail,
  forgotPasswordEmail,
};
