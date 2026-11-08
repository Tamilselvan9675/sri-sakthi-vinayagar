import { NextResponse } from "next/server";
import { z } from "zod";
import { getPayloadClient } from "@/lib/cms/payload";
import { sendContactEmails } from "@/lib/email/contact-mail";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().trim().min(3).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().regex(/^[0-9]{10}$/),
  message: z.string().trim().min(10).max(5000),
  rating: z.number().int().min(1).max(5).optional(),
  locale: z.string().max(5).optional(),
  // Honeypot: real visitors never fill this hidden field.
  website: z.string().max(0).optional(),
});

const MAX_PER_EMAIL_PER_HOUR = 5;

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }
  const { website: _website, locale = "en", ...data } = parsed.data;

  const payload = await getPayloadClient();

  const recent = await payload.count({
    collection: "contact-messages",
    overrideAccess: true,
    where: {
      email: { equals: data.email },
      createdAt: { greater_than: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    },
  });
  if (recent.totalDocs >= MAX_PER_EMAIL_PER_HOUR) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  // 1) Save in PostgreSQL first so a message is never lost if email fails.
  const saved = await payload.create({
    collection: "contact-messages",
    overrideAccess: true,
    data: { ...data, visitorLocale: locale },
  });

  // 2) Confirmation to the visitor + notification to the temple.
  const result = await sendContactEmails({ ...data, locale });
  if (result.error) console.error("[contact] email delivery issue:", result.error);

  await payload.update({
    collection: "contact-messages",
    id: saved.id,
    overrideAccess: true,
    data: {
      confirmationSent: result.confirmationSent,
      notificationSent: result.notificationSent,
      emailError: result.error?.slice(0, 500),
    },
  });

  return NextResponse.json({ ok: true });
}
