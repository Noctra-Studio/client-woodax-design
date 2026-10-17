"use server";

import { Resend } from "resend";
import {
  detailsContent,
  flagPossibleSpam,
  LeadNotificationEmail,
  notificationContent,
} from "@/emails/lead-notification";
import { serverEnv } from "@/lib/env";
import {
  fieldErrorsFrom,
  honeypotFilled,
  isSilentSubmission,
  leadDetailsPayload,
  leadDetailsSchema,
  leadError,
  leadPayload,
  leadSchema,
  MIN_SUBMIT_MS,
  parseContact,
  readLeadValues,
  submitElapsedMs,
} from "@/features/leads/schema";
import type { LeadActionState } from "@/features/leads/state";

const resend = new Resend(serverEnv.RESEND_API_KEY);

export async function submitLead(
  _previous: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const values = readLeadValues(formData);

  if (honeypotFilled(formData)) {
    console.info("Lead discarded: honeypot");
    return { status: "success", delivered: false, values };
  }

  const elapsed = submitElapsedMs(formData);
  const flagged = elapsed !== null && elapsed < MIN_SUBMIT_MS;

  const parsed = leadSchema.safeParse(leadPayload(formData));
  if (!parsed.success) {
    return {
      status: "error",
      delivered: false,
      fieldErrors: fieldErrorsFrom(parsed.error),
      values,
    };
  }

  const lead = parsed.data;
  const content = notificationContent(lead, new Date());
  const message =
    flagged && elapsed !== null ? flagPossibleSpam(content, elapsed) : content;
  const contact = parseContact(lead.contact);
  const sent = await sendEmail({
    to:
      lead.site === "design"
        ? serverEnv.CONTACT_TO_EMAIL
        : serverEnv.CONTACT_TO_EMAIL_CNC,
    subject: message.subject,
    replyTo: contact?.kind === "email" ? contact.value : undefined,
    content: message,
  });

  if (!sent) {
    return {
      status: "error",
      delivered: false,
      fieldErrors: { form: leadError.generic },
      values,
    };
  }

  return {
    status: "success",
    delivered: true,
    ...(flagged ? { flagged: true } : {}),
    values,
  };
}

export async function submitLeadDetails(
  _previous: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const values = readLeadValues(formData);

  if (isSilentSubmission(formData)) {
    return { status: "success", values };
  }

  const parsed = leadDetailsSchema.safeParse(leadDetailsPayload(formData));
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error),
      values,
    };
  }

  const details = parsed.data;
  const content = detailsContent(details, new Date());
  const contact = parseContact(details.contact);
  const sent = await sendEmail({
    to:
      details.site === "design"
        ? serverEnv.CONTACT_TO_EMAIL
        : serverEnv.CONTACT_TO_EMAIL_CNC,
    subject: content.subject,
    replyTo: contact?.kind === "email" ? contact.value : undefined,
    content,
  });

  if (!sent) {
    return {
      status: "error",
      fieldErrors: { form: leadError.generic },
      values,
    };
  }

  return { status: "success", values };
}

async function sendEmail({
  to,
  subject,
  replyTo,
  content,
}: {
  to: string;
  subject: string;
  replyTo?: string;
  content: ReturnType<typeof notificationContent>;
}) {
  try {
    const result = await resend.emails.send({
      from: serverEnv.CONTACT_FROM_EMAIL,
      to,
      subject,
      ...(replyTo ? { replyTo } : {}),
      react: LeadNotificationEmail(content),
    });

    if (result.error) {
      console.error(
        result.error.message
          ? `${result.error.name}: ${result.error.message}`
          : result.error,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
