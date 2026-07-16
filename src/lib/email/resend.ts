import { Resend } from "resend";
import { logEmail } from "@/lib/repos/email-logs";

/**
 * Demo mode (default): every email is written to EmailLog only, no real send.
 * Real sends require an explicit opt-in (RESEND_LIVE_SEND=true) plus RESEND_API_KEY,
 * per Rule 13 — dev/demo emails must not leave the building by accident.
 */
export async function sendEmail(data: { to: string; subject: string; body: string }) {
  await logEmail(data);

  const liveSendEnabled = process.env.RESEND_LIVE_SEND === "true";
  const apiKey = process.env.RESEND_API_KEY;
  if (!liveSendEnabled || !apiKey) return { sent: false };

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) throw new Error("RESEND_FROM_EMAIL must be set to send live email");

  await resend.emails.send({
    from,
    to: data.to,
    subject: data.subject,
    text: data.body,
  });
  return { sent: true };
}
