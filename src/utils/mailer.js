const nodemailer = require("nodemailer");

let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || "false") === "true";

  if (!host || !user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
};

const sendMail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    // Beginner-friendly fallback so verification flow still works locally.
    console.log("[MAIL DISABLED] Set SMTP_* env vars to send real email.");
    console.log(`[MAIL PREVIEW] To: ${to}`);
    console.log(`[MAIL PREVIEW] Subject: ${subject}`);
    console.log(`[MAIL PREVIEW] HTML: ${html}`);
    return { accepted: [to], previewOnly: true };
  }

  return transporter.sendMail({
    from: process.env.MAIL_FROM || "noreply@logicrow.com",
    to,
    subject,
    html,
  });
};

module.exports = {
  sendMail,
};
