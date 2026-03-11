/**
 * Transactional email via Resend.
 * Used for purchase confirmations; magic-link auth uses NextAuth's email provider.
 */

import { Resend } from "resend";

const RESEND_API_KEY =
  process.env.RESEND_API_KEY || process.env.EMAIL_SERVER_PASSWORD;
const FROM =
  process.env.EMAIL_FROM || "Almost Home <noreply@almost-home.io>";

function getResend(): Resend | null {
  if (!RESEND_API_KEY) return null;
  return new Resend(RESEND_API_KEY);
}

export async function sendPurchaseConfirmation(
  to: string,
  credits: number
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn("Resend not configured (RESEND_API_KEY or EMAIL_SERVER_PASSWORD); skipping purchase email.");
    return { ok: false, error: "Email not configured" };
  }

  const subject = "Your subscription has been recharged — Almost Home";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #e4e4e7;">
  <div style="max-width: 480px; margin: 0 auto; padding: 32px 24px;">
    <p style="color: #818cf8; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px;">
      Almost Home
    </p>
    <h1 style="font-size: 22px; font-weight: 300; color: #fff; margin: 0 0 16px 0;">
      Signal received.
    </h1>
    <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      <strong style="color: #e4e4e7;">${credits} credits</strong> have been added to your subscription. The counter hums — louder now.
    </p>
    <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 0;">
      The multiverse is waiting. Every version of home is one letter off.
    </p>
    <p style="color: #52525b; font-size: 12px; margin-top: 32px;">
      You received this email because you purchased credits at almost-home.io.
    </p>
  </div>
</body>
</html>
  `.trim();

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject,
      html,
    });
    if (error) {
      console.error("Resend purchase email error:", error);
      return { ok: false, error: String(error.message) };
    }
    return { ok: true };
  } catch (err) {
    console.error("Failed to send purchase confirmation email:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
