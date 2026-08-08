const { RESEND_API_KEY, EMAIL_FROM } = require("../config/env");
const logger = require("../utils/logger");

/**
 * Sends an email via Resend's REST API (https://resend.com/docs/api-reference/emails/send-email).
 * Uses the built-in `fetch` (Node 18+) instead of an SDK/nodemailer to keep
 * this dependency-free.
 *
 * IMPORTANT: Resend's free tier only lets you send to your OWN verified
 * account email address until you verify a custom domain at resend.com/domains.
 * Until then, use the same email you signed up to Resend with when testing
 * the forgot-password flow, or emails will silently fail to deliver to
 * other addresses.
 */
async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY || RESEND_API_KEY.trim() === "") {
    logger.warn("[email] RESEND_API_KEY is not set - skipping actual send. Set it in .env to send real emails.");
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    logger.error(`[email] Resend API error (${response.status}): ${JSON.stringify(data)}`);
    throw new Error(data.message || "Failed to send email");
  }

  logger.info(`[email] Sent "${subject}" to ${to} (id: ${data.id})`);
  return data;
}

async function sendPasswordResetEmail({ to, resetUrl, name }) {
  return sendEmail({
    to,
    subject: "Reset your ReadMyCode password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Hi ${name || "there"},</p>
        <p>We received a request to reset your ReadMyCode password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #888; font-size: 12px;">Or copy this link: ${resetUrl}</p>
      </div>
    `,
  });
}

module.exports = { sendEmail, sendPasswordResetEmail };