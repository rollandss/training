import nodemailer from "nodemailer";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function canSendEmail() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM);
}

export function getBaseUrl() {
  return process.env.PUBLIC_BASE_URL || "http://localhost:3000";
}

export async function sendEmail(params: { to: string; subject: string; text: string; html?: string }) {
  const host = requiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");
  const from = requiredEnv("EMAIL_FROM");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
}

