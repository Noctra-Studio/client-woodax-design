"use server";

import { Resend } from "resend";
import {
  detailsContent,
  LeadNotificationEmail,
  notificationContent,
} from "@/emails/lead-notification";
import { serverEnv } from "@/lib/env";
import {
  fieldErrorsFrom,
  isSilentSubmission,
  leadDetailsPayload,
  leadDetailsSchema,
  leadError,
  leadPayload,
  leadSchema,
  parseContact,
  readLeadValues,
} from "@/features/leads/schema";
import type { LeadActionState } from "@/features/leads/state";

const resend = new Resend(serverEnv.RESEND_API_KEY);

export async function submitLead(
  _previous: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const values = readLeadValues(formData);

  if (isSilentSubmission(formData)) {
    return { status: "success", values };
  }

  const parsed = leadSchema.safeParse(leadPayload(formData));
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error),
      values,
    };
  }

  const lead = parsed.data;
  const content = notificationContent(lead, new Date());
  const contact = parseContact(lead.contact);
  const sent = await sendEmail({
    to:
      lead.site === "design"
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
