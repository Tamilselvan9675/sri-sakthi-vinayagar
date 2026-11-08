import { Resend } from "resend";

export type ContactEmailPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
  rating?: number | null;
  locale: string;
};

export type ContactEmailResult = {
  confirmationSent: boolean;
  notificationSent: boolean;
  error?: string;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

/**
 * Server-only. Sends the visitor confirmation and the temple notification.
 *   RESEND_API_KEY            Resend API key
 *   RESEND_FROM_EMAIL         verified sender, e.g. "Sri Sakthi Vinayagar <no-reply@yourdomain.com>"
 *   CONTACT_NOTIFICATION_EMAIL  inbox that receives new-message notifications
 * Never throws: the message is already saved, so failures are reported back.
 */
export async function sendContactEmails(payload: ContactEmailPayload): Promise<ContactEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const notifyTo = process.env.CONTACT_NOTIFICATION_EMAIL?.trim();

  if (!apiKey || !from || !notifyTo) {
    const missing = [
      !apiKey && "RESEND_API_KEY",
      !from && "RESEND_FROM_EMAIL",
      !notifyTo && "CONTACT_NOTIFICATION_EMAIL",
    ].filter(Boolean);
    return { confirmationSent: false, notificationSent: false, error: `Email not configured: ${missing.join(", ")}` };
  }

  const resend = new Resend(apiKey);
  const name = escapeHtml(payload.name);
  const message = escapeHtml(payload.message).replace(/\n/g, "<br>");
  const ta = payload.locale === "ta";

  const [confirmation, notification] = await Promise.allSettled([
    resend.emails.send({
      from,
      to: payload.email,
      replyTo: notifyTo,
      subject: ta ? "உங்கள் செய்தி கிடைத்தது - ஸ்ரீ சக்தி விநாயகர் கோயில்" : "We received your message - Sri Sakthi Vinayagar Temple",
      html: ta
        ? `<p>வணக்கம் ${name},</p><p>உங்கள் செய்திக்கு நன்றி. விரைவில் உங்களை தொடர்புகொள்வோம்.</p><p><strong>உங்கள் செய்தி:</strong><br>${message}</p><p>ஸ்ரீ சக்தி விநாயகர் கோயில்</p>`
        : `<p>Hello ${name},</p><p>Thank you for contacting Sri Sakthi Vinayagar Temple. We have received your message and will get back to you soon.</p><p><strong>Your message:</strong><br>${message}</p><p>Sri Sakthi Vinayagar Temple</p>`,
    }),
    resend.emails.send({
      from,
      to: notifyTo,
      replyTo: payload.email,
      subject: `New contact message from ${payload.name}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${escapeHtml(payload.email)}</p><p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>${
        payload.rating ? `<p><strong>Rating:</strong> ${payload.rating}/5</p>` : ""
      }<p><strong>Message:</strong><br>${message}</p>`,
    }),
  ]);

  const outcome = (r: PromiseSettledResult<{ error: { message: string } | null }>) =>
    r.status === "fulfilled" ? r.value.error?.message : r.reason instanceof Error ? r.reason.message : "Unknown error";
  const confirmationError = outcome(confirmation);
  const notificationError = outcome(notification);

  return {
    confirmationSent: !confirmationError,
    notificationSent: !notificationError,
    error:
      [confirmationError && `confirmation: ${confirmationError}`, notificationError && `notification: ${notificationError}`]
        .filter(Boolean)
        .join("; ") || undefined,
  };
}

export type ContactReplyPayload = {
  to: string;
  visitorName: string;
  subject: string;
  reply: string;
  originalMessage: string;
};

/**
 * Admin reply to a visitor (sent from the Payload CMS). Unlike the automatic
 * emails this throws on failure so the admin sees why the reply was not sent.
 */
export async function sendContactReply(payload: ContactReplyPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const replyTo = process.env.CONTACT_NOTIFICATION_EMAIL?.trim();
  if (!apiKey || !from) {
    throw new Error("Email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.");
  }

  const body = escapeHtml(payload.reply).replace(/\n/g, "<br>");
  const original = escapeHtml(payload.originalMessage).replace(/\n/g, "<br>");

  const { error } = await new Resend(apiKey).emails.send({
    from,
    to: payload.to,
    replyTo: replyTo || undefined,
    subject: payload.subject,
    text: `${payload.reply}\n\n--- Your message ---\n${payload.originalMessage}`,
    html: `<p>${body}</p><hr><p style="color:#666"><strong>Your message:</strong><br>${original}</p><p>Sri Sakthi Vinayagar Temple</p>`,
  });
  if (error) throw new Error(error.message);
}
