import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  const port = Number(process.env.SMTP_PORT ?? "465");
  const from = process.env.EMAIL_FROM?.trim();

  if (!host || !user || !pass || !from) return null;

  return {
    host,
    port: Number.isFinite(port) ? port : 465,
    secure: (Number.isFinite(port) ? port : 465) === 465,
    auth: { user, pass },
    from,
  };
}

export function isMailConfigured(): boolean {
  return getSmtpConfig() !== null;
}

function getTransporter(): Transporter | null {
  const config = getSmtpConfig();
  if (!config) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }
  return transporter;
}

export async function sendMail(input: {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = getSmtpConfig();
  const transport = getTransporter();
  if (!config || !transport) {
    console.info("[mailer] SMTP no configurado; mail omitido:", input.subject);
    return { ok: false, error: "SMTP no configurado" };
  }

  try {
    await transport.sendMail({
      from: config.from,
      to: Array.isArray(input.to) ? input.to.join(", ") : input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return { ok: true };
  } catch (err) {
    console.error("[mailer] send failed", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al enviar",
    };
  }
}

export async function verifyMailer(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const transport = getTransporter();
  if (!transport) return { ok: false, error: "SMTP no configurado" };
  try {
    await transport.verify();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Verify falló",
    };
  }
}
