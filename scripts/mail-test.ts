import { sendMail, verifyMailer } from "../src/lib/mailer";

async function main() {
  const verify = await verifyMailer();
  if (!verify.ok) {
    console.error("SMTP verify falló:", verify.error);
    process.exit(1);
  }
  console.log("SMTP verify OK");

  const to =
    process.env.ADMIN_NOTIFY_EMAILS?.split(",")[0]?.trim() ||
    process.env.ADMIN_EMAILS?.split(",")[0]?.trim();

  if (!to) {
    console.error("Definí ADMIN_NOTIFY_EMAILS o ADMIN_EMAILS para el destinatario");
    process.exit(1);
  }

  const result = await sendMail({
    to,
    subject: "Manjares — prueba SMTP",
    text: "Si recibís este mail, la configuración SMTP está bien.",
    html: "<p>Si recibís este mail, la configuración SMTP está bien.</p>",
  });

  if (!result.ok) {
    console.error("Envío falló:", result.error);
    process.exit(1);
  }

  console.log("Mail de prueba enviado a", to);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
