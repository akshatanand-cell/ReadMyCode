const { RESEND_API_KEY, EMAIL_FROM, CLIENT_URL } = require("../config/env");
const logger = require("../utils/logger");

const APP_URL = CLIENT_URL || "https://readmycode.vercel.app";

function getEmailFooter(unsubscribeToken, email) {
  const unsubUrl = `${APP_URL}/unsubscribe?token=${unsubscribeToken || "default"}&email=${encodeURIComponent(email || "")}`;
  return `
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6; text-align: center;">
      <p style="margin: 0 0 6px 0;"><strong>ReadMyCode</strong> &bull; AI Codebase Documentation Engine</p>
      <p style="margin: 0 0 8px 0;">Bengaluru, Karnataka, India &bull; Support: <a href="mailto:support@readmycode.dev" style="color: #10b981; text-decoration: none;">support@readmycode.dev</a></p>
      <p style="margin: 0;">
        <a href="${unsubUrl}" style="color: #64748b; text-decoration: underline;">Unsubscribe from email updates</a> &bull;
        <a href="${APP_URL}/privacy" style="color: #64748b; text-decoration: underline;">Privacy Policy</a> &bull;
        <a href="${APP_URL}/terms" style="color: #64748b; text-decoration: underline;">Terms of Service</a>
      </p>
    </div>
  `;
}

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY || RESEND_API_KEY.trim() === "") {
    logger.info(`[email-simulated] RESEND_API_KEY not configured. Simulated delivery of "${subject}" to ${to}`);
    return { skipped: true, simulated: true, to, subject };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM || "ReadMyCode <notifications@readmycode.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error(`[email] Resend API error (${response.status}): ${JSON.stringify(data)}`);
      return { error: data.message || "Failed to send email" };
    }

    logger.info(`[email] Sent "${subject}" to ${to} (id: ${data.id})`);
    return data;
  } catch (err) {
    logger.error(`[email] Network failure sending to ${to}: ${err.message}`);
    return { error: err.message };
  }
}

async function sendPasswordResetEmail({ to, resetUrl, name }) {
  const footer = getEmailFooter("account-security", to);
  return sendEmail({
    to,
    subject: "Reset your ReadMyCode password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; color: #0f172a;">
        <div style="margin-bottom: 20px;">
          <h2 style="margin: 0; color: #0f172a; font-size: 20px;">Reset Your Password</h2>
        </div>
        <p style="font-size: 14px; color: #334155;">Hi ${name || "there"},</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">We received a request to reset your ReadMyCode account password. Click the button below to choose a new password. This link is valid for 30 minutes.</p>
        <div style="margin: 28px 0; text-align: center;">
          <a href="${resetUrl}" style="background: #10b981; color: #000000; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #64748b;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        ${footer}
      </div>
    `,
  });
}

async function sendOtpVerificationEmail({ to, otp, name }) {
  const footer = getEmailFooter("security-otp", to);
  return sendEmail({
    to,
    subject: `Your ReadMyCode Verification Code: ${otp}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; color: #0f172a;">
        <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px;">One-Time Security Verification</h2>
        <p style="font-size: 14px; color: #334155;">Hi ${name || "Developer"},</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">Use the one-time verification code (OTP) below to authenticate your action. This code expires in 10 minutes.</p>
        <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; text-align: center;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #64748b;">Never share this code with anyone. ReadMyCode team members will never ask for your OTP.</p>
        ${footer}
      </div>
    `,
  });
}

async function sendWelcomeOfferEmail({ to, name, unsubscribeToken }) {
  const footer = getEmailFooter(unsubscribeToken, to);
  return sendEmail({
    to,
    subject: "Welcome to ReadMyCode! Exclusive Pro Starter Access",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; color: #0f172a;">
        <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 22px;">Welcome to ReadMyCode, ${name || "Developer"}!</h2>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">Thank you for creating your account. Your workspace is ready to transform raw GitHub repositories into production-ready specifications, interactive architecture maps, and agent rules.</p>
        
        <div style="margin: 20px 0; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
          <p style="margin: 0 0 6px 0; font-weight: bold; color: #166534; font-size: 13px;">🎁 New Developer Welcome Offer:</p>
          <p style="margin: 0; font-size: 13px; color: #15803d;">Enjoy your 15 free monthly repository scans, plus a 14-day risk-free trial of our Pro Engineer tier.</p>
        </div>

        <div style="margin: 24px 0; text-align: center;">
          <a href="${APP_URL}/dashboard" style="background: #10b981; color: #000000; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            Open Your Workspace
          </a>
        </div>
        ${footer}
      </div>
    `,
  });
}

async function sendNewsletterWelcomeEmail({ to, unsubscribeToken }) {
  const footer = getEmailFooter(unsubscribeToken, to);
  return sendEmail({
    to,
    subject: "You're subscribed to ReadMyCode Developer Updates",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; color: #0f172a;">
        <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px;">You're on the list!</h2>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">You have successfully subscribed to the ReadMyCode developer dispatch. We send practical updates on AST codebase analysis, autonomous agent rules, and performance engineering.</p>
        <p style="font-size: 12px; color: #64748b;">You can unsubscribe with a single click at any time using the link below.</p>
        ${footer}
      </div>
    `,
  });
}

async function sendPaymentSuccessEmail({ to, name, planName, amount, currency, gateway }) {
  const footer = getEmailFooter("billing", to);
  return sendEmail({
    to,
    subject: `Payment Confirmed: Welcome to ReadMyCode ${planName}!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; color: #0f172a;">
        <div style="display: inline-block; padding: 4px 10px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; color: #059669; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">Payment Confirmed</div>
        <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 22px;">You're upgraded to ${planName}!</h2>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hi ${name || "Developer"}, thank you for supporting ReadMyCode! Your payment of <strong>${currency.toUpperCase()} ${amount}</strong> via ${gateway.toUpperCase()} has been processed successfully.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;"><strong>Plan:</strong> ${planName}</p>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;"><strong>Status:</strong> Active (Unlimited Scans & Priority Compute)</p>
          <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>14-Day Guarantee:</strong> Full refund if you're not completely satisfied.</p>
        </div>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${APP_URL}/dashboard" style="display: inline-block; background: #0071e3; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">Open Workspace & Analyze Repos</a>
        </div>
        ${footer}
      </div>
    `,
  });
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendOtpVerificationEmail,
  sendWelcomeOfferEmail,
  sendNewsletterWelcomeEmail,
  sendPaymentSuccessEmail,
};
