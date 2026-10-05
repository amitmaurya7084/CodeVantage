/**
 * Email sending over an HTTPS API (Brevo) instead of SMTP.
 * Render's free plan blocks outbound SMTP ports (25/465/587) but allows HTTPS,
 * so this works on the free plan with no SMTP setup at all.
 *
 * Email is optional: if BREVO_API_KEY / MAIL_FROM_EMAIL are not set, emails are
 * simply skipped (a log line is written) and the rest of the app works normally.
 * Note: forgot-password links are delivered by email, so that flow needs it.
 */

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Sends an email and never throws — a failed notification should never break
 * the request that triggered it (registration, review decision, payment, etc.).
 * Failures are logged server-side for visibility instead.
 */
async function sendEmail({ to, subject, html }) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.MAIL_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
      console.warn(`Email skipped (email not configured): "${subject}" to ${to}`);
      return;
    }

    const response = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: process.env.MAIL_FROM_NAME || "CodeVantage", email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`Failed to send email "${subject}" to ${to}: ${response.status} ${detail.slice(0, 200)}`);
    }
  } catch (err) {
    console.error(`Failed to send email "${subject}" to ${to}:`, err.message);
  }
}

module.exports = { sendEmail };
